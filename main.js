const net = require('net');
const { InstanceBase, InstanceStatus, runEntrypoint, TCPHelper } = require('@companion-module/base');
const UpgradeScripts = require('./upgrades');
const configFields = require('./config');
const actions = require('./actions');
const feedbacks = require('./feedbacks');
const variables = require('./variables');

class AETAModule extends InstanceBase {
  constructor(internal) {
    super(internal);
    this.config = {};
    this.socket = null; // Changed from undefined to null for clearer initialization
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
    
    // Initialize config first
    this.config = config;

    // Initialize base state
    this.updateStatus(InstanceStatus.Connecting);

    try {
      // Initialize module components
      await this.initModule();
      
      // Initialize TCP connection last
      await this.initTCP();
      
      this.isInitialized = true;
      this.log('info', 'Module initialization completed successfully');
    } catch (error) {
      this.log('error', `Initialization failed: ${error.message}`);
      this.updateStatus(InstanceStatus.ConnectionFailure);
    }
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
      } else {
        this.log('warn', 'Socket not connected during polling interval');
      }
    }, interval);

    if (this.config.enableVUMeter) {
      // Start VU meter updates if enabled
      const vuInterval = parseInt(this.config.vuMeterInterval) || 100;
      this.vuMeterInterval = setInterval(() => {
        if (this.socket?.isConnected) {
          this.queueCommand('AT#VU=1');
        }
      }, vuInterval);
    }
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
        // Only update module status if it's a failure or disconnection
        if (status === InstanceStatus.ConnectionFailure || status === InstanceStatus.Disconnected) {
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
        // Send initial command right after connection
        if (this.socket?.isConnected) {
          this.socket.send('ATI\r\n').catch((e) => {
            this.log('error', `Failed to send initial command: ${e.message}`);
          });
        }
      });

      this.socket.on('data', (data) => {
        // Add incoming data to buffer
        this.dataBuffer += data.toString();
        
        // Process complete messages from buffer
        let newlineIndex;
        while ((newlineIndex = this.dataBuffer.indexOf('\r')) !== -1 || (newlineIndex = this.dataBuffer.indexOf('\n')) !== -1) {
          const msg = this.dataBuffer.substring(0, newlineIndex).trim();
          this.dataBuffer = this.dataBuffer.substring(newlineIndex + 1);
          
          if (msg.length > 0) {
            this.log('debug', `Received: ${msg}`);
            
            // If we get any valid response, mark as connected and initialize
            if (!this.feedbackState.codecConnected && msg.length > 0) {
              this.log('info', 'Got response from codec - marking as connected');
              this.feedbackState.codecConnected = true;
              this.updateStatus(InstanceStatus.Ok);
              this.initializeCodec();
            }
            
            this.parseResponse(msg);
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
    this.log('info', 'Initializing codec');
    // Send initialization commands in sequence with small delays
    setTimeout(() => {
      if (this.config.password) {
        this.sendRawCommand(`AT#PWD=${this.config.password}`);
      }
      setTimeout(() => {
        this.sendRawCommand('AT#RINGING_1=1');
        setTimeout(() => {
          this.sendRawCommand('AT#CALLING_1=1');
          setTimeout(() => {
            this.sendRawCommand('AT#ESTABLISHED_1=1');
            setTimeout(() => {
              this.sendRawCommand('AT#RELEASED_1=1');
              setTimeout(() => {
                // Get general configuration
                this.sendRawCommand('AT&V');   // Basic configuration
                this.sendRawCommand('AT#SUP'); // Get current status including N1
                this.sendRawCommand('AT&V0');  // Last connected numbers
                this.sendRawCommand('AT&V1');  // Line configuration
                this.sendRawCommand('AT&V2');  // ISDN configuration
                this.sendRawCommand('AT&V3');  // Audio configuration
                this.sendRawCommand('AT&V4');  // X24/V11 configuration
                this.sendRawCommand('AT&V5');  // Mobile configuration
                this.sendRawCommand('AT&V6');  // VoIP/IP configuration
                this.sendRawCommand('AT&V7');  // External devices configuration
                this.sendRawCommand('AT&V8');  // Auxiliary functions configuration
                this.sendRawCommand('AT&V9');  // Network configuration
                // Only start polling if it's enabled in config
                if (this.config.enablePolling) {
                  this.startPolling();
                } else {
                  this.log('debug', 'Polling disabled in config - not starting polling');
                }
              }, 100);
            }, 100);
          }, 100);
        }, 100);
      }, 100);
    }, 100);
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
        
        // Close the socket gracefully if it's still connected
        if (this.socket?.isConnected) {
          await new Promise((resolve) => {
            this.socket.end(() => {
              resolve();
            });
          });
        }
        
        // Force destroy after graceful close
        this.socket.destroy();
      } catch (error) {
        this.log('error', `Socket cleanup error: ${error.message}`);
      } finally {
        // Only set to null after cleanup attempts are done
        this.socket = null;
      }
    }

    // Update status to reflect disconnected state
    this.updateStatus(InstanceStatus.Disconnected);
  }

  queueCommand(command) {
    if (!command) return;
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
        this.log('debug', `Last connected number updated from N1: ${number}`);
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
      this.feedbackState.ringing = true;
      this.feedbackState.calling = false;
      this.feedbackState.established = false;
      this.feedbackState.released = false;
      this.setVariableValues({ ringing: 'True', calling: 'False', established: 'False', released: 'False' });
      this.checkFeedbacks('ringing', 'calling', 'established', 'released');
    } else if (response === '$CALLING_1') {
      this.log('info', 'Outgoing call notification');
      this.feedbackState.ringing = false;
      this.feedbackState.calling = true;
      this.feedbackState.established = false;
      this.feedbackState.released = false;
      this.setVariableValues({ ringing: 'False', calling: 'True', established: 'False', released: 'False' });
      this.checkFeedbacks('ringing', 'calling', 'established', 'released');
    } else if (response === '$ESTABLISHED_1' || response === 'CONNECT 1') {
      this.log('info', 'Established event received');
      this.feedbackState.ringing = false;
      this.feedbackState.calling = false;
      this.feedbackState.established = true;
      this.feedbackState.released = false;
      this.feedbackState.codecConnected = true;
      this.setVariableValues({ ringing: 'False', calling: 'False', established: 'True', released: 'False' });
      this.checkFeedbacks('ringing', 'calling', 'established', 'released');
    } else if (response === '$RELEASED_1') {
      this.log('info', 'Released event received');
      this.feedbackState.ringing = false;
      this.feedbackState.calling = false;
      this.feedbackState.established = false;
      this.feedbackState.released = true;
      this.feedbackState.codecConnected = false;
      this.setVariableValues({ ringing: 'False', calling: 'False', established: 'False', released: 'True' });
      this.checkFeedbacks('ringing', 'calling', 'established', 'released');
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
    } else {
      const match = response.match(/^#(\w+)=(.+)/);
      if (match) {
        const key = match[1];
        const value = match[2].split(' ')[0];
        switch (key) {
          case '5AS':
            this.setVariableValues({ '5AS': value === '1' ? 'On' : 'Off' });
            break;
          case 'COD1':
            const algorithms = {
              '0': 'G722 - H242 (Mono)',
              '1': 'G711 (Mono)',
              '2': 'G722 - H221',
              '4': 'MPEG Layer 2 (Mono)',
              '5': 'MPEG Layer 2 (Dual Mono)',
              '7': 'G722 - SRT',
              '10': 'AAC-LC (Mono)',
              '17': 'Opus (Mono)',
              '50': 'Opus (Mono)',
              '51': 'Opus (Stereo)',
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
              //'6': 'Mobile IP',
            };
            this.setVariableValues({ networkType: types[value] || `Unknown (${value})` });
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
            const redIndex = key.slice(3);
            this.setVariableValues({ [`redundancy${redIndex}`]: value === '1' ? 'On' : 'Off' });
            break;
          case 'LCT':
            this.setVariableValues({ lineConnectionType: value });
            break;
          case 'LLBC':
            this.setVariableValues({ llbc: value });
            break;
          case 'LLBR':
            this.setVariableValues({ llbr: value });
            break;
          case 'FRE':
            this.setVariableValues({ frequency: value });
            break;
          case 'SYNC':
            this.setVariableValues({ syncMode: value === '0' ? 'Genlock' : 'Master' });
            break;
          case 'AES':
            const aesRates = { '0': '32 kHz', '1': '48 kHz', '2': '96 kHz' };
            this.setVariableValues({ aesSamplingRate: aesRates[value] || value });
            break;
          case 'GIN':
            this.setVariableValues({ gainIn: value });
            break;
          case 'GOUT':
            this.setVariableValues({ gainOut: value });
            break;
          case 'TAE':
            this.setVariableValues({ tae: value });
            break;
          case 'HLC':
            this.setVariableValues({ hlc: value });
            break;
          case 'NBR':
            this.setVariableValues({ nbr: value });
            break;
          case 'TTR':
            this.setVariableValues({ ttr: value });
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
          default:
            // Only log if it's not an AT command echo or continuation marker
            if (!key.startsWith('AT') && !key.startsWith('-C')) {
              this.log('debug', `Received parameter ${key}=${value}`);
            }
            break;
        }
      } else if (response.startsWith('COD1:S=')) {
        const status = response.split('=')[1];
        this.setVariableValues({ codecStatus: status });
        this.feedbackState.codecConnected = status === '11';
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
      } else if (!response.startsWith('AT') && !response.startsWith('-C') && response !== '') {
        // Only log unhandled responses that aren't AT command echoes, continuation markers, or empty lines
        this.log('debug', `Response: "${response}"`);
      }
    }
    this.checkFeedbacks('codecConnected');
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