const { InstanceBase, InstanceStatus, runEntrypoint, TCPHelper } = require('@companion-module/base');
const dgram = require('dgram');
const UpgradeScripts = require('./upgrades');
const configFields = require('./config');
const actions = require('./actions');
const feedbacks = require('./feedbacks');
const variables = require('./variables');
const { GetPresetsList } = require('./presets');

class AETAModule extends InstanceBase {
  constructor(internal) {
    super(internal);
    this.config = {};
    this.socket = null; // Changed from undefined to null for clearer initialization
    this.udpSocket = null;
    this.dataBuffer = ''; // Added missing buffer initialization
    this.pollingInterval = null;
    this.vuMeterInterval = null; // Added explicit vuMeter interval tracking
    this.reconnectTimer = null;
    this.audioLevels = { input: -60, output: -60 };
    this.commandQueue = [];
    this.isProcessingCommands = false;
    this.reconnectInterval = 5000;
    this.isInitialized = false;  // Add initialization tracking
    this.feedbackState = {
      ringing: false,
      calling: false,
      established: false,
      released: false,
      codecConnected: false
    };
    this.refreshDataTimeout = null;
    this.refreshDataDelay = 1000; // 1 second delay between refresh calls
  }

  initModule() {
    this.log('debug', '***** initModule ENTRY POINT REACHED *****');
    this.updateStatus(InstanceStatus.Disconnected);
    this.init_actions();
    this.init_feedbacks();
    this.init_variables();
    // Set preset definitions
    if (this.setPresetDefinitions) {
      this.setPresetDefinitions(GetPresetsList());
      this.log('debug', 'Preset definitions set');
    }
  }

  init_actions() {
    this.log('debug', '***** init_actions ENTRY POINT REACHED *****');
    this.setActionDefinitions(actions.getActionDefinitions(this));
  }

  init_feedbacks() {
    this.log('debug', '***** init_feedbacks ENTRY POINT REACHED *****');
    this.setFeedbackDefinitions(feedbacks.getFeedbackDefinitions(this));
  }

  init_variables() {
    this.log('debug', '***** init_variables ENTRY POINT REACHED *****');
    variables.initVariables.call(this);
  }

  async destroy() {
    await this.cleanup();  // Use our robust cleanup method instead of direct destruction
  }

  async init(config) {
    this.log('info', '***** init ENTRY POINT REACHED *****');
    this.log('debug', `Initializing with config: ${JSON.stringify(config)}`);
    this.config = config;

    // Check for valid configuration
    if (!this.config.ip) {
      this.updateStatus(InstanceStatus.BadConfig);
      this.log('warn', 'Missing IP configuration');
      await this.initModule(); // Still init module to load actions/feedbacks
      return;
    }

    this.updateStatus(InstanceStatus.Connecting);
    try {
      await this.initModule();
      await this.initTCP();
      // Initialize UDP if enabled
      await this.initUDP();

      this.isInitialized = true;
      this.log('info', 'Module initialization started');
    } catch (error) {
      this.log('error', `Initialization failed: ${error.message}`);
      this.updateStatus(InstanceStatus.ConnectionFailure);
    }
  }

  async onConnectionEstablished() {
      this.updateStatus(InstanceStatus.Ok);
      this.log('info', 'Connection established, configuring codec...');
      
      // Authenticate
      let pwdCmd = 'AT#PWD=';
      if (this.config.password && this.config.password.length > 0) {
        pwdCmd += this.config.password;
      }
      this.queueCommand(pwdCmd);

      // Activate event notifications for codec 1
      this.queueCommand('AT#ESTABLISHED_1=1');
      this.queueCommand('AT#RINGING_1=1');
      this.queueCommand('AT#CALLING_1=1');
      this.queueCommand('AT#RELEASED_1=1');

      // Fetch all codec parameters using AT&Vx commands
      const vCommands = [
        'ATI', // Basic info and alarms
        'AT&V0', 'AT&V1', 'AT&V2', 'AT&V3', 'AT&V4', 'AT&V5', 'AT&V6', 'AT&V7', 'AT&V8', 'AT&V9',
        'AT&V10', 'AT&V11', 'AT&V20', 'AT&V21'
      ];
      for (const cmd of vCommands) {
        this.queueCommand(cmd);
      }
      
      // Send AT#VISU command to codec if connected via TCP
      if (this.config.enableVUMeter && this.config.udpIp) {
          let period = parseInt(this.config.vuMeterInterval) || 150;
          if (period < 150) period = 150;
          period = Math.ceil(period / 50) * 50; // Ensure multiple of 50
          const cmd = `AT#VISU=${this.config.udpIp}:${this.config.udpPort} ${period}`;
          this.queueCommand(cmd);
          this.log('info', `Sent VU config: ${cmd}`);
      }

      this.startPolling();
  }
  // Wait for TCP socket to connect
  async waitForSocketConnect(timeout = 5000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (this.socket && this.socket.isConnected) {
          resolve();
        } else if (Date.now() - start > timeout) {
          reject(new Error('TCP connection timeout'));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  // Send command and wait for response (simple implementation)
  async sendRawCommandAndWait(command, timeout = 1000) {
    return new Promise((resolve, reject) => {
      let responded = false;
      const onData = (data) => {
        responded = true;
        this.socket.off('data', onData);
        resolve(data);
      };
      this.socket.on('data', onData);
      this.sendRawCommand(command);
      setTimeout(() => {
        if (!responded) {
          this.socket.off('data', onData);
          reject(new Error(`Timeout waiting for response to ${command}`));
        }
      }, timeout);
    });
  }

  // Force config fields to be updated in the interface
  getConfigFields() {
    this.log('debug', 'getConfigFields called');
    return configFields;
  }

  // Handle configuration updates
  async configUpdated(config) {
    this.log('warn', '***** configUpdated ENTRY POINT REACHED *****');
    this.log('debug', `Old config: ${JSON.stringify(this.config)}`);
    this.log('debug', `New config: ${JSON.stringify(config)}`);
    this.log('debug', `Module initialization state: ${this.isInitialized}`);

    try {
      // Call parent class configUpdated if it exists
      await super.configUpdated?.(config);

      // Stop any existing connection and polling
      await this.cleanup();  // Use cleanup instead of individual calls

      // Update config BEFORE creating new connection
      this.config = config;
      this.log('debug', `Updated config, initializing connection to ${this.config.ip}:${this.config.port}`);

      // Reset feedback states
      this.feedbackState = {
        ringing: false,
        calling: false,
        established: false,
        released: false,
        codecConnected: false
      };

      // Initialize a fresh connection with new config
      await this.initTCP();
      await this.initUDP();
      
      this.log('info', 'Configuration update completed successfully');
    } catch (error) {
      this.log('error', `Configuration update failed: ${error.message}`);
      this.updateStatus(InstanceStatus.ConnectionFailure);
    }
  }

  startPolling() {
    this.stopPolling();

    if (!this.config.enablePolling) {
      return;
    }

    const interval = parseInt(this.config.pollingInterval) || 5000;
    this.log('debug', `Starting polling with interval ${interval}ms`);

    this.pollingInterval = setInterval(() => {
      if (this.socket?.isConnected) {
        this.log('debug', 'Sending polling commands');
        // Send all AT&V commands to get full system status
        this.queueCommand('AT&V');  // Basic configuration
        this.queueCommand('AT#SUP'); // Get current status including N1
        this.queueCommand('AT&V0'); // Last connected numbers
        this.queueCommand('AT&V1'); // Line configuration
        this.queueCommand('AT&V2'); // ISDN configuration
        this.queueCommand('AT&V3'); // Audio configuration
        this.queueCommand('AT&V4'); // X24/V11 configuration
        this.queueCommand('AT&V5'); // Mobile configuration
        this.queueCommand('AT&V6'); // VoIP/IP configuration
        this.queueCommand('AT&V7'); // External devices configuration
        this.queueCommand('AT&V8'); // Auxiliary functions configuration
        this.queueCommand('AT&V9'); // Network configuration
        this.queueCommand('AT&V11'); // Event activation state
      } else {
        this.log('warn', 'Socket not connected during polling interval');
      }
    }, interval);



    // VU Meter is now handled via UDP (AT#VISU) in initUDP()
    // Legacy polling removed to prevent conflict
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    if (this.vuMeterInterval) {
      clearInterval(this.vuMeterInterval);
      this.vuMeterInterval = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  initTCP() {
    if (this.socket) {
      this.socket.destroy()
      this.socket = null;
    }

    if (!this.config.ip) {
      this.log('debug', 'Missing IP configuration');
      this.updateStatus(InstanceStatus.BadConfig);
      return;
    }

    this.updateStatus(InstanceStatus.Connecting);

    try {
      this.socket = new TCPHelper(this.config.ip, this.config.port);

      this.socket.on('status_change', (status, message) => {
        this.log('debug', `Socket status change: ${status} - ${message}`);
        
        if (status === InstanceStatus.Ok) {
          this.onConnectionEstablished();
        }

        // Only update module status if it's a failure or disconnection
        if (status !== InstanceStatus.Ok && status !== InstanceStatus.Connecting) {
          this.updateStatus(status, message);
          this.feedbackState.codecConnected = false;
        }
      });

      this.socket.on('error', (err) => {
        this.updateStatus(InstanceStatus.ConnectionFailure, err.message);
        this.log('error', 'Network error: ' + err.message);
        this.feedbackState.codecConnected = false;
      });

      this.socket.on('connect', () => {
        this.log('info', `Connected to ${this.config.ip}:${this.config.port}`);
      });

      this.socket.on('data', (data) => {
        // Log the rawest possible incoming data (Buffer)
        this.log('info', `[CODEC RAW]`, data);

        // Add incoming data to buffer using latin1 encoding
        this.dataBuffer += data.toString('latin1');

        // Log every processed TCP message received (latin1 string)
        this.log('info', `[CODEC] ${data.toString('latin1').trim()}`);

        // Split buffer on all line endings (\n, \r)
        let lines = this.dataBuffer.split(/\n|\r/);
        this.dataBuffer = lines.pop(); // Save incomplete line for next chunk

        for (const msg of lines) {
          const trimmedMsg = msg.trim();
          if (trimmedMsg.length > 0) {
            // If we get any valid response, mark as connected and initialize
            if (!this.feedbackState.codecConnected && trimmedMsg.length > 0) {
              this.log('info', 'Got response from codec - marking as connected');
              this.feedbackState.codecConnected = true;
              this.updateStatus(InstanceStatus.Ok);
              this.initializeCodec();
            }
            this.parseResponse(trimmedMsg);
          }
        }

        // Handle unsolicited events that may not be terminated by \r or \n
        // List of known unsolicited event patterns
        const unsolicitedEvents = [
          '$RINGING_1',
          '$CALLING_1',
          '$ESTABLISHED_1',
          '$RELEASED_1',
          'CONNECT 1'
        ];

        for (const event of unsolicitedEvents) {
          if (this.dataBuffer.includes(event)) {
            this.log('info', `Detected unsolicited event in buffer: ${event}`);
            this.parseResponse(event);
            // Do NOT remove the event from buffer, keep buffer intact for further processing
          }
        }
      });

      this.socket.on('close', () => {
        this.log('info', 'Connection closed');
        this.updateStatus(InstanceStatus.Disconnected);
        this.stopPolling();
        this.feedbackState.codecConnected = false;
        variables.initVariables.call(this);
      });

    } catch (error) {
      this.log('error', `TCP initialization failed: ${error.message}`);
      this.updateStatus(InstanceStatus.ConnectionFailure, error.message);
    }
  }

  initializeCodec() {
    // No longer used: replaced by async init flow
    this.log('info', 'initializeCodec() is now handled by async init()');
  }

  sendRawCommand(command) {
    if (!command) {
      this.log('debug', 'Attempted to send empty command');
      return;
    }

    if (!this.socket?.isConnected) {
      this.log('warn', 'Cannot send command - socket not connected');
      return;
    }

    // Send command exactly as provided with no modifications
    this.socket.send(command).catch((error) => {
      this.log('error', `Failed to send command "${command}": ${error.message}`);
      if (error.message.includes('not connected')) {
        this.feedbackState.codecConnected = false;
        this.updateStatus(InstanceStatus.ConnectionFailure);
      }
    });
  }

  async cleanup() {
    // Stop any ongoing processes first
    this.stopPolling();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Properly destroy the socket if it exists
    if (this.socket) {
      try {
        // Remove all listeners first to prevent any callbacks during cleanup
        this.socket.removeAllListeners();
        // Directly destroy the socket
        this.socket.destroy();
      } catch (error) {
        this.log('error', `Socket cleanup error: ${error.message}`);
      } finally {
        // Only set to null after cleanup attempts are done
        this.socket = null;
      }
    }

    if (this.udpSocket) {
      try {
        this.udpSocket.close();
      } catch (e) {
        this.log('error', `UDP cleanup error: ${e.message}`);
      }
      this.udpSocket = null;
    }

    // Update status to reflect disconnected state
    this.updateStatus(InstanceStatus.Disconnected);
  }

  async initUDP() {
    if (this.udpSocket) {
      try {
        this.udpSocket.close();
      } catch (e) {}
      this.udpSocket = null;
    }

    if (!this.config.enableVUMeter || !this.config.udpPort) {
      return;
    }

    this.log('info', `Initializing UDP listener on port ${this.config.udpPort}`);
    
    try {
      this.udpSocket = dgram.createSocket('udp4');
      
      this.udpSocket.on('error', (err) => {
        this.log('error', `UDP error: ${err.stack}`);
        this.udpSocket.close();
        this.udpSocket = null;
      });

      this.udpSocket.on('message', (msg, rinfo) => {
        const msgStr = msg.toString().trim();
        
        // Log ALL incoming UDP messages for debugging
        this.log('debug', `UDP Message received: ${msgStr}`);

        // Handle $BAR=n,p,q,r format (Tx Left, Tx Right, Rx Left, Rx Right)
        // Values are negative dBFS (e.g. 20 means -20 dBFS). 99 means silence (-infinity)
        if (msgStr.startsWith('$BAR=')) {
             const parts = msgStr.substring(5).split(',').map(Number);
             if (parts.length >= 4) {
                 // Convert 99 to -100 (effectively silence)
                 // Otherwise negate the value to get dBFS (e.g. 20 -> -20)
                 const txLeft = parts[0] === 99 ? -100 : -parts[0];
                 const txRight = parts[1] === 99 ? -100 : -parts[1];
                 const rxLeft = parts[2] === 99 ? -100 : -parts[2];
                 const rxRight = parts[3] === 99 ? -100 : -parts[3];

                 // Use the maximum of Left/Right for the summary mono level
                 this.audioLevels = { 
                     txLeft,
                     txRight,
                     rxLeft,
                     rxRight
                 };
                 
                 this.setVariableValues({ 
                     audioLevel: `Tx: ${txLeft}/${txRight} Rx: ${rxLeft}/${rxRight}`,
                     audioLevelTxLeft: txLeft,
                     audioLevelTxRight: txRight,
                     audioLevelRxLeft: rxLeft,
                     audioLevelRxRight: rxRight
                 });
                 this.checkFeedbacks('vuMeter');
             }
        }
        // Handle legacy #VU=input,output format (just in case)
        else if (msgStr.startsWith('#VU=')) {
             const [input, output] = msgStr.substring(4).split(',').map(Number);
             this.audioLevels = { input: input || -60, output: output || -60 };
             this.setVariableValues({ audioLevel: `In: ${this.audioLevels.input} dB, Out: ${this.audioLevels.output} dB` });
             this.checkFeedbacks('vuMeter');
        }
      });

      this.udpSocket.bind(parseInt(this.config.udpPort));
      
      // Send AT#VISU command to codec if connected via TCP
      // We do this here to ensure it's sent whenever we set up UDP
      if (this.socket?.isConnected && this.config.udpIp) {
          let period = parseInt(this.config.vuMeterInterval) || 150;
          if (period < 150) period = 150;
          period = Math.ceil(period / 50) * 50; // Ensure multiple of 50
          const cmd = `AT#VISU=${this.config.udpIp}:${this.config.udpPort} ${period}`;
          this.queueCommand(cmd);
          this.log('info', `Sent VU config: ${cmd}`);
      }

    } catch (e) {
      this.log('error', `Failed to init UDP: ${e.message}`);
    }
  }

  queueCommand(command) {
    if (!command) return;

    // Smart Deduplication:
    // If the command is a status/config query (AT&V..., AT#SUP), 
    // and it's already in the queue, don't add it again.
    // This prevents queue flooding during slow connections or rapid refreshes.
    const isQuery = command.startsWith('AT&V') || command.startsWith('AT#SUP') || command.startsWith('AT#VISU');
    
    if (isQuery && this.commandQueue.includes(command)) {
      // Command already queued, skipping duplicate
      return;
    }

    // Keep command as-is without stripping CR/LF
    this.commandQueue.push(command);
    this.processCommandQueue();
  }

  async processCommandQueue() {
    if (this.isProcessingCommands || !this.socket || this.socket.destroyed || !this.socket?.isConnected) {
      return;
    }

    this.isProcessingCommands = true;
    while (this.commandQueue.length > 0) {
      const command = this.commandQueue.shift();
      if (!command) continue;

      try {
        this.log('debug', `Sending command: "${command}"`);
        await this.sendCommand(command);
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay between commands
      } catch (error) {
        this.log('error', `Failed to send command "${command}": ${error.message}`);
      }
    }
    this.isProcessingCommands = false;
  }

  sendCommand(command) {
    return new Promise((resolve, reject) => {
      if (!this.socket?.isConnected) {
        return reject(new Error('Socket not connected'));
      }

      try {
        // Send command exactly as provided with no modifications
        this.socket.send(command).then(() => {
          resolve();
        }).catch((error) => {
          this.log('error', `Send error: ${error.message}`);
          reject(error);
        });
      } catch (error) {
        this.log('error', `Send error: ${error.message}`);
        reject(error);
      }
    });
  }

  reconnect() {
    this.stopPolling();
    
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Log current configuration for debugging
    this.log('debug', `Current config during reconnect - IP: ${this.config.ip}, Port: ${this.config.port}`);

    this.reconnectTimer = setTimeout(() => {
      this.log('info', `Attempting to reconnect to ${this.config.ip}:${this.config.port}...`);
      this.initTCP();  // Changed from connect() to initTCP()
    }, this.reconnectInterval);
  }

  debouncedRefreshData() {
    if (this.refreshDataTimeout) {
      clearTimeout(this.refreshDataTimeout);
    }
    
    this.refreshDataTimeout = setTimeout(() => {
      this.refreshData();
      this.refreshDataTimeout = null;
    }, this.refreshDataDelay);
  }

  refreshData() {
    if (this.socket?.isConnected && !this.socket.destroyed) {
      this.log('info', 'Refreshing codec data');
      // Send all AT&V commands to get complete configuration
      this.queueCommand('AT&V');  // Basic configuration
      this.queueCommand('AT#SUP'); // Get current status including N1
      this.queueCommand('AT&V0'); // Last connected numbers
      this.queueCommand('AT&V1'); // Line configuration
      this.queueCommand('AT&V2'); // ISDN configuration
      this.queueCommand('AT&V3'); // Audio configuration
      this.queueCommand('AT&V4'); // X24/V11 configuration
      this.queueCommand('AT&V5'); // Mobile configuration
      this.queueCommand('AT&V6'); // VoIP/IP configuration
      this.queueCommand('AT&V7'); // External devices configuration
      this.queueCommand('AT&V8'); // Auxiliary functions configuration
      this.queueCommand('AT&V9'); // Network configuration
      this.queueCommand('AT&V11'); // Event activation state
    } else {
      this.log('warn', 'Cannot refresh data - codec not connected');
    }
  }

  parseResponse(response) {
    // First handle connection verification
    if (!this.feedbackState.codecConnected && (response.includes('SCOOP') || response === 'OK')) {
      this.log('info', 'Codec responded - connection verified');
      this.feedbackState.codecConnected = true;
      this.updateStatus(InstanceStatus.Ok);
      
      // Initialize the codec
      this.initializeCodec();
      return;
    }

    // Check for AT#SUP response with N1= key
    if (response.includes('N1=')) {
      const match = response.match(/N1=(\d+)/);
      if (match) {
        const number = match[1];
        this.setVariableValues({ lastConnectedNumber: number });
      }
      return;
    }

    // Rest of the parsing logic
    if (response === 'OK') {
      this.setVariableValues({ connectionStatus: 'Connected' });
      // Update connection state since we got a valid OK response
      if (!this.feedbackState.codecConnected) {
        this.log('info', 'Setting codec as connected due to OK response');
        this.feedbackState.codecConnected = true;
        this.updateStatus(InstanceStatus.Ok);
      }
    } else if (response.startsWith('ERROR')) {
      this.log('warn', `Error response received: "${response}"`);
      const errorCode = response.match(/\d+/)?.[0];
      // AARC protocol error codes
      switch(errorCode) {
        case '0':
          this.log('warn', 'Command not recognized');
          break;
        case '3':
          this.log('warn', 'Command not allowed in current state');
          break;
        case '4':
          this.log('warn', 'Parameter value out of range');
          break;
        case '5':
          this.log('warn', 'Invalid parameter');
          break;
        case '7':
          this.log('warn', 'System busy');
          break;
        case '8':
          this.log('warn', 'Command not allowed (system locked)');
          break;
        case '51':
        case '53':
          this.log('warn', 'Authentication failed - check password');
          this.queueCommand(`AT#PWD=${this.config.password || ''}`);
          break;
        default:
          this.log('warn', `Unknown error code: ${errorCode}`);
      }
      this.setVariableValues({ 
        connectionStatus: 'Error',
        lastError: `Error ${errorCode || 'unknown'}`
      });
      this.feedbackState.codecConnected = false;
    } else if (response === '$RINGING_1') {
      // Call state notifications from AARC protocol
      this.log('info', 'Incoming call notification');
      this.updateCallState({ ringing: true });
    } else if (response === '$CALLING_1') {
      this.log('info', 'Outgoing call notification');
      this.updateCallState({ calling: true });
    } else if (response === '$ESTABLISHED_1' || response === 'CONNECT 1') {
      this.log('info', 'Established event received');
      this.updateCallState({ established: true, codecConnected: true });
    } else if (response === '$RELEASED_1') {
      this.log('info', 'Released event received');
      this.updateCallState({ released: true, codecConnected: false });
    } else if (response.startsWith('#VU=')) {
      // Parse VU meter response (#VU=input,output)
      const [input, output] = response.substring(4).split(',').map(Number);
      this.audioLevels = {
        input: input || -60,
        output: output || -60
      };
      this.setVariableValues({
        audioLevel: `In: ${input}dB Out: ${output}dB`
      });
      this.checkFeedbacks('vuMeter');
    } else if (response.startsWith('COD1:S=')) {
      const status = response.split('=')[1];
      this.setVariableValues({ codecStatus: status });
      
      // Status 11 indicates established connection
      // This provides redundancy if we missed the $ESTABLISHED event
      const isConnected = status === '11';
      this.feedbackState.codecConnected = isConnected;
      
      if (isConnected) {
        if (!this.feedbackState.established) {
          this.log('info', 'Detected established call via COD1 status');
          this.updateCallState({ established: true, codecConnected: true });
        }
      } else {
        // If we are not connected (and not ringing/calling), ensure established is false
        // We don't force released=true here to avoid overriding transient states if polling is fast
        if (this.feedbackState.established) {
          this.log('info', 'Detected call release via COD1 status');
          this.updateCallState({ released: true, codecConnected: false });
        }
      }
    } else if (response.startsWith('ENT:APPEL1=')) {
      const incoming = response.split('=')[1];
      this.setVariableValues({ incomingCall: incoming === '1' ? 'Yes' : 'No' });
    } else if (response.startsWith('CFG=')) {
      this.setVariableValues({ configNumber: response.split('=')[1] });
    } else if (response.startsWith('BOU=')) {
      this.setVariableValues({ testLoop: response.split('=')[1] });
    } else if (response.startsWith('ALA:D1=')) {
      const [d1, d2, d3] = response.match(/D1=(\d+),D2=(\d+),D3=(\d+)/).slice(1);
      this.setVariableValues({ alarmD1: d1, alarmD2: d2, alarmD3: d3 });
    } else {
      // Handle #KEY=VALUE or KEY=VALUE responses
      const match = response.match(/^#?([A-Z0-9]+)=(.+)/);
      if (match) {
        const key = match[1];
        const value = match[2].split(' ')[0];
        this.updateVariableFromKey(key, value);
      } else if (!response.startsWith('AT') && !response.startsWith('-C') && response !== '') {
        // Handle ATI response (Codec Model) - usually just the model name
        // We assume if it's not any other known format, it might be the model name if we just sent ATI
        // But to be safe, we can check against known model names or just store it if it looks like a model
        if (response.includes('SCOOP') || response.includes('Scoopy')) {
             this.setVariableValues({ codecModel: response });
        }
      }
    }
    this.checkFeedbacks('codecConnected');
  }

  updateCallState(state) {
    // Reset all states first
    this.feedbackState.ringing = false;
    this.feedbackState.calling = false;
    this.feedbackState.established = false;
    this.feedbackState.released = false;

    // Apply new state
    if (state.ringing) this.feedbackState.ringing = true;
    if (state.calling) this.feedbackState.calling = true;
    if (state.established) this.feedbackState.established = true;
    if (state.released) this.feedbackState.released = true;
    
    if (state.codecConnected !== undefined) {
      this.feedbackState.codecConnected = state.codecConnected;
    }

    this.setVariableValues({
      ringing: this.feedbackState.ringing ? 'True' : 'False',
      calling: this.feedbackState.calling ? 'True' : 'False',
      established: this.feedbackState.established ? 'True' : 'False',
      released: this.feedbackState.released ? 'True' : 'False'
    });

    this.checkFeedbacks('ringing', 'calling', 'established', 'released');
  }

  updateVariableFromKey(key, value) {
    switch (key) {
      case 'SPD':
      this.setVariableValues({ potsSpeed: value === '0' ? 'Auto' : 'Fixed' });
      break;
      case 'COD1':
        const algorithms = {
          '0': 'G722 - H242 (Mono)',
          '1': 'G711 (Mono)',
          '2': 'MPEG Layer 2 (Mono)',
          '3': 'MPEG Layer 2 (Dual Mono)',
          '4': 'MPEG Layer 2 (Stereo)',
          '5': 'MPEG Layer 2 (Joint Stereo)',
          '7': 'G722 - SRT',
          '8': 'G722 - H221',
          '9': '4SB ADPCM (Mono)',
          '10': '4SB ADPCM (Stereo)',
          '12': 'TDAC',
          '15': 'MPEG Layer 3 (Mono)',
          '16': 'MPEG Layer 3 (Dual Mono)',
          '17': 'MPEG Layer 3 (Stereo)',
          '18': 'MPEG Layer 3 (Joint Stereo)',
          '19': 'MPEG Layer 2 (Proprietary - Mono)',
          '20': 'MPEG Layer 2 (Proprietary - Dual Mono)',
          '21': 'MPEG Layer 2 (Proprietary - Stereo)',
          '22': 'MPEG Layer 2 (Proprietary - Joint Stereo)',
          '23': 'G722 enc / TDAC dec',
          '24': 'TDAC enc / G722 dec',
          '25': 'MPEG Layer 3 (Proprietary - Mono)',
          '26': 'MPEG Layer 3 (Proprietary - Dual Mono)',
          '27': 'MPEG Layer 3 (Proprietary - Stereo)',
          '28': 'MPEG Layer 3 (Proprietary - Joint Stereo)',
          '30': 'CELP',
          '31': 'Hybrid mode (Analog)',
          '32': 'MPEG AAC-LC (Mono)',
          '33': 'MPEG AAC-LC (Dual Mono)',
          '34': 'MPEG AAC-LC (Stereo)',
          '35': 'MPEG AAC-LC (Joint Stereo)',
          '36': 'MPEG HE-AAC (Mono)',
          '38': 'MPEG HE-AAC (Stereo)',
          '42': 'MPEG HE-AAC v2 (Stereo)',
          '50': 'Opus (Mono)',
          '51': 'Opus (Stereo)',
          '62': 'MPEG AAC-LC-LOAS (Mono)',
          '63': 'MPEG AAC-LC-LOAS (Dual Mono)',
          '64': 'MPEG AAC-LC-LOAS (Stereo)',
          '65': 'MPEG AAC-LC-LOAS (Joint Stereo)',
          '66': 'MPEG HE-AAC-LOAS (Mono)',
          '68': 'MPEG HE-AAC-LOAS (Stereo)',
          '72': 'MPEG HE-AAC v2-LOAS (Stereo)',
          '100': 'L16 (Mono)',
          '101': 'L16 (Stereo)',
          '102': 'L20 (Mono)',
          '103': 'L20 (Stereo)',
          '104': 'L24 (Mono)',
          '105': 'L24 (Stereo)',
        };
        this.setVariableValues({ codingAlgorithm: algorithms[value] || `Unknown (${value})` });
        break;
      case 'NET':
        const types = {
          '0': 'ISDN',
          '1': 'Leased Line',
          '2': 'Analog (Codec)',
          '3': 'Analog (Hybrid)',
          '4': 'Mobile Voice',
          '5': 'IP',
          '6': 'Mobile IP',
        };
        this.setVariableValues({ networkType: types[value] || `Unknown (${value})` });
        break;
      case 'LLBC':
      const backupNets = {
        '0': 'ISDN',
        '5': 'IP',
      };
      this.setVariableValues({ backupCallNetwork: backupNets[value] || `Unknown (${value})` });
      break;
      case 'IPQ':
        const qualities = {
          '0': 'Low',
          '1': 'Medium',
          '2': 'High',
          '3': 'Bad',
          '4': 'Very Bad',
          '5': 'Very High',
        };
        this.setVariableValues({ ipQuality: qualities[value] || `Unknown (${value})` });
        this.checkFeedbacks('ipQualityStatus');
        break;
      case 'FRE':
      const frequencies = {
        '0': '48 kHz',
        '1': '32 kHz',
        '2': '24 kHz',
        '3': '16 kHz',
      };
      this.setVariableValues({ codingSamplingRate: frequencies[value] || `Unknown (${value})` });
      break;
      case 'REP':
        this.setVariableValues({ packetReplication: value === '1' ? 'On' : value === '2' ? 'On (Interleaved)' : 'Off' });
        break;
      case 'CHD1':
        this.setVariableValues({ codingBitRate: `${value} kbps` });
        break;
      case 'NUM1':
      case 'NUM2':
      case 'NUM3':
      case 'NUM4':
      case 'NUM5':
      case 'NUM6':
      case 'NUM7':
      case 'NUM8':
        const numIndex = key.slice(3);
        this.setVariableValues({ [`number${numIndex}`]: value || 'None' });
        break;
      case 'LOC1':
      case 'LOC2':
      case 'LOC3':
      case 'LOC4':
      case 'LOC5':
      case 'LOC6':
      case 'LOC7':
      case 'LOC8':
        const locIndex = key.slice(3);
        this.setVariableValues({ [`location${locIndex}`]: value || 'None' });
        break;
      case 'AUTO1':
      case 'AUTO2':
        const autoIndex = key.slice(4);
        this.setVariableValues({ [`auto${autoIndex}`]: value === '1' ? 'On' : 'Off' });
        break;
      case 'RED1':
      case 'RED2':
        // Mapping both to autoRedial for now as variables.js only has one
        this.setVariableValues({ autoRedial: value === '1' ? 'On' : 'Off' });
        break;
      case 'LCT':
        const loopModes = {
          '0': 'Disabled',
          '1': 'Active (outgoing controlled)',
          '2': 'Active (switch to backup)',
        };
        this.setVariableValues({ loopControlMode: loopModes[value] || `Unknown (${value})` });
        break;
      case 'LLBR':
      this.setVariableValues({ backupReceiveMode: value === '1' ? 'Active' : 'Inactive' });
      break;
      case 'SYNC':
        this.setVariableValues({ aesSyncMode: value === '0' ? 'Genlock' : 'Master' });
        break;
      case 'AES':
        const aesRates = { '0': '32 kHz', '1': '48 kHz', '2': '96 kHz' };
        this.setVariableValues({ aesSamplingRate: aesRates[value] || value });
        break;
      case 'GIN':
      this.setVariableValues({ maxInputLevel: `${value} dBu` });
      break;
      case 'GOUT':
        this.setVariableValues({ maxOutputLevel: `${value} dBu` });
        break;
      case 'CCRi':
      this.setVariableValues({ coordinationChannelRouting: value });
      break;
      case 'TAE':
        const filters = {
          '0': 'Any call accepted',
          '1': 'Only telephone type calls',
          '2': 'Only data type calls',
        };
        this.setVariableValues({ incomingCallFilter: filters[value] || `Unknown (${value})` });
        break;
      case 'HLC':
        this.setVariableValues({ hlc: value });
        break;
      case 'NBR':
        this.setVariableValues({ redialRetries: value });
        break;
      case 'TTR':
        this.setVariableValues({ redialWaitTime: value });
        break;
      case 'DHCP':
        this.setVariableValues({ dhcp: value });
        break;
      case 'IP':
        this.setVariableValues({ ipAddress: value });
        break;
      case 'IPM':
        this.setVariableValues({ ipMask: value });
        break;
      case 'GW':
        this.setVariableValues({ gateway: value });
        break;
      case 'DNS':
        this.setVariableValues({ dns: value });
        break;
      case 'GIS1':
      case 'GIS2':
      case 'GIS3':
        const gisIndex = key.slice(3);
        const gains = { '0': '0 dB', '1': '16 dB', '2': '32 dB', '3': '48 dB' };
        this.setVariableValues({ [`inputGainStep${gisIndex}`]: gains[value] || `Unknown (${value})` });
        break;
      case 'PWR1':
      case 'PWR2':
      case 'PWR3':
        const pwrIndex = key.slice(3);
        const powers = { '0': 'Off', '1': 'Phantom 48V', '2': 'Phantom 12V', '3': 'T12' };
        this.setVariableValues({ [`phantomPower${pwrIndex}`]: powers[value] || `Unknown (${value})` });
        break;
      case 'LIM1':
      case 'LIM2':
      case 'LIM3':
        const limIndex = key.slice(3);
        this.setVariableValues({ [`limiter${limIndex}`]: value === '1' ? 'On' : 'Off' });
        break;
      case '5AS':
        this.setVariableValues({ '5AS': value === '1' ? 'Active' : 'Inactive' });
        break;
      case 'ALARM':
        this.setVariableValues({ activeAlarms: value });
        break;
      case 'TYP':
        const audioTypes = {
          '0': 'Analog',
          '1': 'ISDN',
          '2': 'Ethernet',
          '3': 'Mobile',
          '4': 'USB'
        };
        this.setVariableValues({ audioInterfaceFormat: audioTypes[value] || `Unknown (${value})` });
        break;
      case 'AUD':
        this.setVariableValues({ audioStatus: value });
        break;
      case 'VOR':
        this.setVariableValues({ auxAudioChannel: value === '1' ? 'Enabled' : 'Disabled' });
        break;
      case 'PAN':
        this.setVariableValues({ channelPanning: value });
        break;
      case 'CLK':
        this.setVariableValues({ clockMode: value === '0' ? 'Standard' : 'Free' });
        break;
      case 'CCR':
        this.setVariableValues({ coordinationChannelRouting: value });
        break;
      case 'COP':
        this.setVariableValues({ copyright: value === '0' ? 'Active' : 'Inactive' });
        break;
      case 'BAU':
        const bauds = {
          '0': '300', '1': '1200', '2': '2400', '3': '4800', '4': '9600'
        };
        this.setVariableValues({ dataChannelBaudRate: bauds[value] || value });
        break;
      case 'CDA':
        this.setVariableValues({ dataChannelEnabled: value === '1' ? 'Enabled' : 'Disabled' });
        break;
      case 'DIA':
        this.setVariableValues({ dialMethod: value === '0' ? 'Tone' : 'Pulse' });
        break;
      case 'TON':
        this.setVariableValues({ dialTone: value === '0' ? 'Detect' : 'No Detection' });
        break;
      case 'COR':
        this.setVariableValues({ errorCorrection: `Mode ${value}` });
        break;
      case 'GPI1':
      case 'GPI2':
        const gpiIndex = key.slice(3);
        this.setVariableValues({ [`gpi${gpiIndex}`]: value === '1' ? 'Closed' : 'Open' });
        break;
      case 'GPO1':
      case 'GPO2':
        const gpoIndex = key.slice(3);
        this.setVariableValues({ [`gpo${gpoIndex}`]: value === '1' ? 'Closed' : 'Open' });
        break;
      case 'IMP':
        this.setVariableValues({ inputImpedance: value === '0' ? '600 Ohm' : 'High Z' });
        break;
      case 'PAD1':
      case 'PAD2':
      case 'PAD3':
        // Assuming single variable for now or need to add indexed variables if multiple pads
        this.setVariableValues({ inputPad: value === '1' ? 'On' : 'Off' });
        break;
      case 'JIT':
        this.setVariableValues({ jitterBuffer: `${value} ms` });
        break;
      case 'LEV':
        const levels = {
          '0': '0 dBm', '1': '-3 dBm', '2': '-6 dBm', '3': '-9 dBm',
          '4': '-10 dBm', '5': '-13 dBm', '6': '-16 dBm'
        };
        this.setVariableValues({ lineLevel: levels[value] || value });
        break;
      case 'ZIN':
        this.setVariableValues({ inputImpedance: value === '0' ? '600 Ohm' : 'High Z' });
        break;
      case 'REL':
        this.setVariableValues({ relayTransmission: value === '1' ? 'Active' : 'Disabled' });
        break;
      case 'OSEL':
        const oselModes = {
          '0': 'Send Signal',
          '1': 'Receive Signal',
          '2': 'Send/Receive Mix'
        };
        this.setVariableValues({ outputSignal: oselModes[value] || `Unknown (${value})` });
        break;
      default:
        break;
    }
  }

  getNetworkTypeText(type) {
    const types = {
      '0': 'ISDN',
      '1': 'Leased Line',
      '2': 'Analog (Codec)',
      '3': 'Analog (Hybrid)',
      '4': 'Mobile Voice',
      '5': 'IP',
      '6': 'Mobile IP'
    };
    return types[type] || 'Unknown';
  }
}

// Export the instance class and support info for proper module registration
module.exports = {
  moduleClass: AETAModule,
  upgradeScripts: UpgradeScripts,
};

// Initialize the module
runEntrypoint(module.exports.moduleClass, UpgradeScripts);