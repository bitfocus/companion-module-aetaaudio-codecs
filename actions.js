module.exports = {
	getActionDefinitions(instance) {
	  return {
		dial: {
		  name: 'Dial Number',
		  description: 'Initiate a call to a phone number or SIP URI using the configured codec. You can enter a value or use a variable.',
		  options: [
			{
			  type: 'textinput',
			  label: 'Phone Number or SIP URI',
			  id: 'number',
			  default: '',
			  tooltip: 'Enter a phone number (e.g., 123456789) or SIP URI (e.g., sip:user@example.com) or use a variable',
			  useVariables: true,
			},
		  ],
		  callback: async (event) => {
			instance.log('info', 'Dial action triggered');
			if (!instance.feedbackState.codecConnected) {
			  instance.log('warn', 'Codec not connected - cannot dial');
			  return;
			}
			if (!instance.socket?.isConnected) {
			  instance.log('warn', 'Socket not connected - cannot dial');
			  return;
			}
			let number = event.options.number;
			if (instance.parseVariables) {
			  number = await instance.parseVariables(number);
			}
			if (!number) {
			  instance.log('warn', 'No number provided for dial action');
			  return;
			}
			try {
			  // First store the number and wait for OK
			  await instance.sendCommand(`AT#NUM1=${number}`);
			  // Wait a short moment to ensure the command was processed
			  await new Promise(resolve => setTimeout(resolve, 100));
			  // Then initiate the call as a separate command
			  await instance.sendCommand('ATDS1');
			  instance.log('info', `Dialing ${number}`);
			  instance.debouncedRefreshData(); // Use debounced version
			} catch (error) {
			  instance.log('error', `Failed to dial: ${error.message}`);
			}
		  },
		},
		hangup: {
		  name: 'Hang Up',
		  description: 'Terminate the current call on the active codec.',
		  options: [],
		  callback: async () => {
			instance.log('info', 'Hang Up action triggered');
			if (!instance.socket?.isConnected || instance.socket.destroyed) {
			  instance.log('warn', 'Codec not connected - cannot hang up');
			  return;
			}
			try {
			  await instance.sendCommand('ATH1');
			  instance.log('info', 'Call hung up successfully');
			  instance.debouncedRefreshData(); // Use debounced version
			} catch (error) {
			  instance.log('error', `Failed to hang up: ${error.message}`);
			}
		  },
		},
		set5AS: {
		  name: 'Set 5A System',
		  description: 'Enable or disable the 5A system feature on the device.',
		  options: [
			{
			  type: 'dropdown',
			  label: 'State',
			  id: 'state',
			  default: '1',
			  choices: [
				{ id: '1', label: 'On' },
				{ id: '0', label: 'Off' },
			  ],
			},
		  ],
		  callback: async (event) => {
			instance.log('info', 'Set 5A System action triggered');
			if (!instance.socket?.isConnected || instance.socket.destroyed) {
			  instance.log('warn', 'Codec not connected - cannot set 5A System');
			  return;
			}
			try {
			  await instance.sendCommand(`AT#5AS=${event.options.state}`);
			  instance.log('info', `5A System set to ${event.options.state === '1' ? 'On' : 'Off'}`);
			  instance.debouncedRefreshData(); // Use debounced version
			} catch (error) {
			  instance.log('error', `Failed to set 5A System: ${error.message}`);
			}
		  },
		},
		setCodingAlgorithm: {
		  name: 'Set Coding Algorithm',
		  description: 'Select the audio coding algorithm for the codec.',
		  options: [
			{
			  type: 'dropdown',
			  label: 'Algorithm',
			  id: 'algorithm',
			  default: '7', // Changed to G722-SRT as a common default
			  choices: [
				{ id: '0', label: 'G722 - H242 (Mono)' },
				{ id: '1', label: 'G711 (Mono)' },
				{ id: '7', label: 'G722 - SRT' },  // Most common for IP
				{ id: '2', label: 'G722 - H221' },
				{ id: '4', label: 'MPEG Layer 2 (Mono)' },
				{ id: '5', label: 'MPEG Layer 2 (Dual Mono)' },
				{ id: '17', label: 'Opus (Mono)' },
				{ id: '50', label: 'Opus (Mono)' },
				{ id: '51', label: 'Opus (Stereo)' },
			  ],
			},
		  ],
		  callback: async (event) => {
			instance.log('info', 'Set Coding Algorithm action triggered');
			if (!instance.socket?.isConnected) {
			  instance.log('warn', 'Codec not connected - cannot set algorithm');
			  return;
			}
			try {
			  await instance.sendCommand(`AT#COD1=${event.options.algorithm}`);
			  instance.log('info', `Coding algorithm set to ${event.options.algorithm}`);
			  instance.debouncedRefreshData(); // Use debounced version
			} catch (error) {
			  instance.log('error', `Failed to set coding algorithm: ${error.message}`);
			}
		  },
		},
		setNetworkType: {
		  name: 'Set Network Type',
		  description: 'Select the active transmission interface (ISDN, IP, etc.).',
		  options: [
			{
			  type: 'dropdown',
			  label: 'Network Type',
			  id: 'type',
			  default: '5', // IP is a common default
			  choices: [
				{ id: '0', label: 'ISDN' },
				{ id: '1', label: 'Leased Line' },
				{ id: '2', label: 'Analog (Codec)' },
				{ id: '3', label: 'Analog (Hybrid)' },
				{ id: '4', label: 'Mobile Voice' },
				{ id: '5', label: 'IP' },
				{ id: '6', label: 'Mobile IP' },
			  ],
			},
		  ],
		  callback: async (event) => {
			instance.log('info', 'Set Network Type action triggered');
			if (!instance.socket?.isConnected) {
			  instance.log('warn', 'Codec not connected - cannot set network type');
			  return;
			}
			try {
			  await instance.sendCommand(`AT#NET=${event.options.type}`);
			  instance.log('info', `Network type set to ${event.options.type}`);
			  instance.debouncedRefreshData(); // Use debounced version
			} catch (error) {
			  instance.log('error', `Failed to set network type: ${error.message}`);
			}
		  },
		},
		setIPQuality: {
		  name: 'Set IP Quality',
		  description: 'Set the IP network quality parameter for the codec.',
		  options: [
			{
			  type: 'dropdown',
			  label: 'IP Quality',
			  id: 'quality',
			  default: '1', // Medium as default
			  choices: [
				{ id: '0', label: 'Low' },
				{ id: '1', label: 'Medium' },
				{ id: '2', label: 'High' },
				{ id: '3', label: 'Bad' },
				{ id: '4', label: 'Very Bad' },
				{ id: '5', label: 'Very High' },
			  ],
			},
		  ],
		  callback: async (event) => {
			instance.log('info', 'Set IP Quality action triggered');
			if (!instance.socket?.isConnected || instance.socket.destroyed) {
			  instance.log('warn', 'Codec not connected - cannot set IP quality');
			  return;
			}
			try {
			  await instance.sendCommand(`AT#IPQ=${event.options.quality}`);
			  instance.log('info', `IP quality set to ${event.options.quality}`);
			  instance.debouncedRefreshData(); // Use debounced version
			} catch (error) {
			  instance.log('error', `Failed to set IP quality: ${error.message}`);
			}
		  },
		},
		setPacketReplication: {
		  name: 'Set Packet Replication',
		  description: 'Configure the packet replication feature for IP transmission.',
		  options: [
			{
			  type: 'dropdown',
			  label: 'Replication Mode',
			  id: 'state',
			  default: '0',
			  choices: [
				{ id: '0', label: 'Off' },
				{ id: '1', label: 'On' },
				{ id: '2', label: 'On (Interleaved)' },
			  ],
			},
		  ],
		  callback: async (event) => {
			instance.log('info', 'Set Packet Replication action triggered');
			if (!instance.socket?.isConnected || instance.socket.destroyed) {
			  instance.log('warn', 'Codec not connected - cannot set packet replication');
			  return;
			}
			try {
			  await instance.sendCommand(`AT#REP=${event.options.state}`);
			  instance.log('info', `Packet replication set to ${event.options.state}`);
			  instance.debouncedRefreshData(); // Use debounced version
			} catch (error) {
			  instance.log('error', `Failed to set packet replication: ${error.message}`);
			}
		  },
		},
		setCodingBitRate: {
		  name: 'Set Coding Bit Rate',
		  description: 'Set the bit rate for the selected codec.',
		  options: [
			{
			  type: 'dropdown',
			  label: 'Bit Rate',
			  id: 'bitrate',
			  default: '7', // 128 kbps as a common default
			  choices: [
				{ id: '0', label: '16 kbps' },
				{ id: '1', label: '32 kbps' },
				{ id: '3', label: '64 kbps' },
				{ id: '5', label: '96 kbps' },
				{ id: '7', label: '128 kbps' },
				{ id: '11', label: '192 kbps' },
				{ id: '15', label: '256 kbps' },
			  ],
			},
		  ],
		  callback: async (event) => {
			instance.log('info', 'Set Coding Bit Rate action triggered');
			if (!instance.socket?.isConnected || instance.socket.destroyed) {
			  instance.log('warn', 'Codec not connected - cannot set bit rate');
			  return;
			}
			try {
			  await instance.sendCommand(`AT#CHD1=${event.options.bitrate}`);
			  instance.log('info', `Coding bit rate set to ${event.options.bitrate}`);
			  instance.debouncedRefreshData(); // Use debounced version
			} catch (error) {
			  instance.log('error', `Failed to set coding bit rate: ${error.message}`);
			}
		  },
		},
		refreshData: {
		  name: 'Refresh Data',
		  description: 'Manually refresh the device status and data.',
		  options: [],
		  callback: async () => {
			instance.log('info', 'Refresh Data action triggered');
			instance.refreshData(); // Use immediate refresh for manual action
		  },
		 },
		monitorAudio: {
			name: 'Monitor Audio Levels',
			description: 'Start or stop periodic monitoring of audio levels.',
			options: [
			  {
				type: 'dropdown',
				label: 'State',
				id: 'state',
				default: '1',
				choices: [
				  { id: '1', label: 'Start Monitoring' },
				  { id: '0', label: 'Stop Monitoring' }
				],
			  }
			],
			callback: async (event) => {
			  instance.log('info', 'Audio monitoring action triggered');
			  if (!instance.socket?.isConnected || instance.socket.destroyed) {
				instance.log('warn', 'Codec not connected - cannot monitor audio');
				return;
			  }
			  const state = event.options.state;
			  // Enable/disable periodic audio level updates
			  instance.queueCommand(`AT#VU=${state}`);
			  instance.log('info', `Audio monitoring ${state === '1' ? 'started' : 'stopped'}`);
			},
		  },
		  setInputGain: {
			name: 'Set Input Gain',
			description: 'Adjust the analogue audio input gain (dB).',
			options: [
			  {
				type: 'number',
				label: 'Gain (dB)',
				id: 'gain',
				default: 0,
				min: -12,
				max: 12,
				required: true
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#GIN=${event.options.gain}`);
				instance.log('info', `Input gain set to ${event.options.gain}`);
				instance.debouncedRefreshData(); // Use debounced version
			  } catch (error) {
				instance.log('error', `Failed to set input gain: ${error.message}`);
			  }
			},
		  },
		  loadPreset: {
			name: 'Load Preset Configuration',
			description: 'Apply a preset configuration for common use cases.',
			options: [
			  {
				type: 'dropdown',
				label: 'Preset',
				id: 'preset',
				default: 'high_quality',
				choices: [
				  { id: 'high_quality', label: 'High Quality (Opus)' },
				  { id: 'low_latency', label: 'Low Latency (G722)' },
				  { id: 'mobile', label: 'Mobile Network' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
	  
			  const presets = {
				high_quality: [
				  'AT#COD1=51',     // Opus Stereo
				  'AT#CHD1=15',     // 256 kbps
				  'AT#FRE=1',       // 48kHz sampling
				],
				low_latency: [
				  'AT#COD1=7',      // G722 SRT
				  'AT#CHD1=3',      // 64 kbps
				  'AT#FRE=0',       // 32kHz sampling
				],
				mobile: [
				  'AT#COD1=17',     // Opus Mono
				  'AT#CHD1=1',      // 32 kbps
				  'AT#FRE=0',       // 32kHz sampling
				]
			  };
	  
			  try {
				const commands = presets[event.options.preset];
				if (commands) {
				  for (const cmd of commands) {
					await instance.sendCommand(cmd);
					await new Promise(resolve => setTimeout(resolve, 100));
				  }
				  instance.log('info', `Preset ${event.options.preset} loaded successfully`);
				  instance.debouncedRefreshData(); // Use debounced version
				}
			  } catch (error) {
				instance.log('error', `Failed to load preset: ${error.message}`);
			  }
			}
		  },
		sendCustomATCommand: {
		  name: 'Send Custom AT# Command',
		  description: 'Send a custom AT# command to the device.',
		  options: [
			{
			  type: 'textinput',
			  label: 'AT# Command',
			  id: 'command',
			  default: '',
			  tooltip: 'Enter the full AT# command, e.g., AT#CMD=VALUE or AT#CMD?',
			  required: true
			}
		  ],
		  callback: async (event) => {
			const cmd = event.options.command.trim();
			if (!cmd.startsWith('AT#')) {
			  instance.log('warn', 'Command must start with AT#');
			  return;
			}
			if (!instance.socket?.isConnected || instance.socket.destroyed) {
			  instance.log('warn', 'Codec not connected - cannot send command');
			  return;
			}
			try {
			  await instance.sendCommand(cmd);
			  instance.log('info', `Custom command sent: ${cmd}`);
			  instance.debouncedRefreshData();
			} catch (error) {
			  instance.log('error', `Failed to send custom command: ${error.message}`);
			}
		  }
		},
		setOutputGain: {
			name: 'Set Output Gain',
			description: 'Adjust the analogue audio output gain (dBu).',
			options: [
			  {
				type: 'number',
				label: 'Output Gain (dBu)',
				id: 'gain',
				default: 0,
				min: -11,
				max: 22,
				required: true
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#GOUT=${event.options.gain}`);
				instance.log('info', `Output gain set to ${event.options.gain}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set output gain: ${error.message}`);
			  }
			},
		  },
		  setDHCPMode: {
			name: 'Set DHCP Mode',
			description: 'Switch between DHCP (automatic) and static IP addressing.',
			options: [
			  {
				type: 'dropdown',
				label: 'DHCP Mode',
				id: 'mode',
				default: '0',
				choices: [
				  { id: '0', label: 'DHCP (Automatic)' },
				  { id: '1', label: 'Static' }
				],
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#DHCP=${event.options.mode}`);
				instance.log('info', `DHCP mode set to ${event.options.mode}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set DHCP mode: ${error.message}`);
			  }
			},
		  },
		  setIPAddress: {
			name: 'Set IP Address',
			description: 'Set the static IP address for the device.',
			options: [
			  {
				type: 'textinput',
				label: 'IP Address',
				id: 'ip',
				default: '',
				tooltip: 'Enter IP address (e.g., 192.168.1.100)',
				required: true
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#IP=${event.options.ip}`);
				instance.log('info', `IP address set to ${event.options.ip}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set IP address: ${error.message}`);
			  }
			},
		  },
		  setDNSAddress: {
			name: 'Set DNS Address',
			description: 'Set the DNS server address for the device.',
			options: [
			  {
				type: 'textinput',
				label: 'DNS Address',
				id: 'dns',
				default: '',
				tooltip: 'Enter DNS address (e.g., 8.8.8.8)',
				required: true
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#DNS=${event.options.dns}`);
				instance.log('info', `DNS address set to ${event.options.dns}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set DNS address: ${error.message}`);
			  }
			},
		  },
		  setGateway: {
			name: 'Set Gateway',
			description: 'Set the default gateway address for the device.',
			options: [
			  {
				type: 'textinput',
				label: 'Gateway Address',
				id: 'gw',
				default: '',
				tooltip: 'Enter gateway address (e.g., 192.168.1.1)',
				required: true
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#GW=${event.options.gw}`);
				instance.log('info', `Gateway set to ${event.options.gw}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set gateway: ${error.message}`);
			  }
			},
		  },
		  setSubnetMask: {
			name: 'Set Subnet Mask',
			description: 'Set the subnet mask for the device network interface.',
			options: [
			  {
				type: 'textinput',
				label: 'Subnet Mask',
				id: 'mask',
				default: '',
				tooltip: 'Enter subnet mask (e.g., 255.255.255.0)',
				required: true
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#IPM=${event.options.mask}`);
				instance.log('info', `Subnet mask set to ${event.options.mask}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set subnet mask: ${error.message}`);
			  }
			},
		  },
		  setLocalEcho: {
			name: 'Set Local Echo',
			description: 'Enable or disable local echo for serial commands.',
			options: [
			  {
				type: 'dropdown',
				label: 'Local Echo',
				id: 'echo',
				default: '1',
				choices: [
				  { id: '1', label: 'Active (default)' },
				  { id: '0', label: 'Off' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`ATE${event.options.echo}`);
				instance.log('info', `Local echo set to ${event.options.echo === '1' ? 'Active' : 'Off'}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set local echo: ${error.message}`);
			  }
			}
		  },
		  setDialMethod: {
			name: 'Set Dial Method',
			description: 'Select the dialing method (tone or pulse) for outgoing calls.',
			options: [
			  {
				type: 'dropdown',
				label: 'Dial Method',
				id: 'method',
				default: '0',
				choices: [
				  { id: '0', label: 'Tone' },
				  { id: '1', label: 'Pulse' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#DIA=${event.options.method}`);
				instance.log('info', `Dial method set to ${event.options.method === '0' ? 'Tone' : 'Pulse'}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set dial method: ${error.message}`);
			  }
			}
		  },
		  setDialTone: {
			name: 'Set Dial Tone',
			description: 'Configure whether to wait for a dial tone before dialing.',
			options: [
			  {
				type: 'dropdown',
				label: 'Dial Tone',
				id: 'tone',
				default: '0',
				choices: [
				  { id: '0', label: 'Detect' },
				  { id: '1', label: 'Do not wait for dial tone' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#TON=${event.options.tone}`);
				instance.log('info', `Dial tone set to ${event.options.tone === '0' ? 'Detect' : 'Do not wait'}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set dial tone: ${error.message}`);
			  }
			}
		  },
		  setISDNCallFilter: {
			name: 'Set ISDN Call Filter',
			description: 'Set the ISDN call filtering mode for incoming calls.',
			options: [
			  {
				type: 'dropdown',
				label: 'Call Filtering Mode',
				id: 'mode',
				default: '0',
				choices: [
				  { id: '0', label: 'Any call accepted' },
				  { id: '1', label: "Only 'telephone' type calls" },
				  { id: '2', label: "Only 'data' type calls" }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#TAE=${event.options.mode}`);
				instance.log('info', `ISDN call filter set to mode ${event.options.mode}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set ISDN call filter: ${error.message}`);
			  }
			}
		  },
		  setProprietaryFilter: {
			name: 'Set Proprietary ISDN Filter',
			description: 'Enable or disable proprietary ISDN call filtering mode.',
			options: [
			  {
				type: 'dropdown',
				label: 'Proprietary Filtering Mode',
				id: 'mode',
				default: '0',
				choices: [
				  { id: '0', label: 'Standard mode' },
				  { id: '1', label: 'Proprietary filtering mode' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#TFS=${event.options.mode}`);
				instance.log('info', `Proprietary ISDN filter set to mode ${event.options.mode}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set proprietary ISDN filter: ${error.message}`);
			  }
			}
		  },
		  setHLC: {
			name: 'Set High Layer Capability (HLC)',
			description: 'Enable or disable HLC encoding for ISDN calls.',
			options: [
			  {
				type: 'dropdown',
				label: 'HLC Encoding',
				id: 'hlc',
				default: '0',
				choices: [
				  { id: '0', label: 'No (default)' },
				  { id: '1', label: 'Yes' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#HLC=${event.options.hlc}`);
				instance.log('info', `HLC set to ${event.options.hlc === '1' ? 'Yes' : 'No'}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set HLC: ${error.message}`);
			  }
			}
		  },
		  setAutoRedial: {
			name: 'Set Auto Redial',
			description: 'Enable or disable automatic redial for the selected codec.',
			options: [
			  {
				type: 'dropdown',
				label: 'Codec',
				id: 'codec',
				default: '1',
				choices: [
				  { id: '1', label: 'Codec 1' },
				  { id: '2', label: 'Codec 2' }
				]
			  },
			  {
				type: 'dropdown',
				label: 'Redial',
				id: 'redial',
				default: '0',
				choices: [
				  { id: '0', label: 'Normal mode' },
				  { id: '1', label: 'Redial active' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#RED${event.options.codec}=${event.options.redial}`);
				instance.log('info', `Auto redial for codec ${event.options.codec} set to ${event.options.redial}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set auto redial: ${error.message}`);
			  }
			}
		  },
		  setRedialRetries: {
			name: 'Set Redial Retries',
			description: 'Set the number of redial attempts after a failed call.',
			options: [
			  {
				type: 'number',
				label: 'Retries',
				id: 'retries',
				default: 1,
				min: 0,
				max: 20
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#NBR=${event.options.retries}`);
				instance.log('info', `Redial retries set to ${event.options.retries}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set redial retries: ${error.message}`);
			  }
			}
		  },
		  setRedialWaitTime: {
			name: 'Set Redial Wait Time',
			description: 'Set the wait time (in seconds) between redial attempts.',
			options: [
			  {
				type: 'number',
				label: 'Wait Time (s)',
				id: 'wait',
				default: 1,
				min: 1,
				max: 30
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#TTR=${event.options.wait}`);
				instance.log('info', `Redial wait time set to ${event.options.wait} seconds`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set redial wait time: ${error.message}`);
			  }
			}
		  },
		  setLoopControl: {
			name: 'Set Loop Control',
			description: 'Configure loop control for outgoing links and backup switching.',
			options: [
			  {
				type: 'dropdown',
				label: 'Loop Control',
				id: 'state',
				default: '0',
				choices: [
				  { id: '0', label: 'Disabled' },
				  { id: '1', label: 'Active (outgoing links controlled by loop)' },
				  { id: '2', label: 'Active, loop switches to backup mode' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#LCT=${event.options.state}`);
				instance.log('info', `Loop control set to ${event.options.state}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set loop control: ${error.message}`);
			  }
			}
		  },
		  setBackupNetwork: {
			name: 'Set Backup Network',
			description: 'Select the backup network type for failover scenarios.',
			options: [
			  {
				type: 'dropdown',
				label: 'Backup Network',
				id: 'network',
				default: '0',
				choices: [
				  { id: '0', label: 'ISDN backup call' },
				  { id: '5', label: 'IP backup call' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#LLBC=${event.options.network}`);
				instance.log('info', `Backup network set to ${event.options.network}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set backup network: ${error.message}`);
			  }
			}
		  },
		  setPassiveBackupMode: {
			name: 'Set Passive Backup Mode',
			description: 'Enable or disable passive backup mode for the device.',
			options: [
			  {
				type: 'dropdown',
				label: 'Passive Backup Mode',
				id: 'mode',
				default: '0',
				choices: [
				  { id: '0', label: 'Inactive' },
				  { id: '1', label: 'Active' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#LLBR=${event.options.mode}`);
				instance.log('info', `Passive backup mode set to ${event.options.mode}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set passive backup mode: ${error.message}`);
			  }
			}
		  },
		  resetDevice: {
			name: 'Reset Device',
			description: 'Send a reset command to reboot the device.',
			options: [],
			callback: async () => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand('ATZ');
				instance.log('info', 'Device reset command sent');
				// No debouncedRefreshData because device will reboot
			  } catch (error) {
				instance.log('error', `Failed to reset device: ${error.message}`);
			  }
			}
		  },
		  setOriginalCopy: {
			name: 'Set Original/Copy Field (MPEG only)',
			description: 'Set the Original/Copy field for MPEG audio streams.',
			options: [
			  {
				type: 'dropdown',
				label: 'Original/Copy',
				id: 'ori',
				default: '0',
				choices: [
				  { id: '0', label: 'Original' },
				  { id: '1', label: 'Copy' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#ORI=${event.options.ori}`);
				instance.log('info', `Original/Copy set to ${event.options.ori}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set Original/Copy: ${error.message}`);
			  }
			}
		  },
		  setCopyright: {
			name: 'Set Copyright Field (MPEG only)',
			description: 'Set the Copyright field for MPEG audio streams.',
			options: [
			  {
				type: 'dropdown',
				label: 'Copyright',
				id: 'cop',
				default: '0',
				choices: [
				  { id: '0', label: 'Active' },
				  { id: '1', label: 'Inactive' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#COP=${event.options.cop}`);
				instance.log('info', `Copyright set to ${event.options.cop}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set copyright: ${error.message}`);
			  }
			}
		  },
		  setErrorCorrection: {
			name: 'Set Error Correction/Protected Mode',
			description: 'Configure error correction or protected mode for audio transmission.',
			options: [
			  {
				type: 'dropdown',
				label: 'Mode',
				id: 'cor',
				default: '0',
				choices: [
				  { id: '0', label: 'Mode 0' },
				  { id: '1', label: 'Mode 1' },
				  { id: '2', label: 'Mode 2' },
				  { id: '3', label: 'Mode 3 (not allowed in Analog/CELP)' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#COR=${event.options.cor}`);
				instance.log('info', `Error correction/protected mode set to ${event.options.cor}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set error correction: ${error.message}`);
			  }
			}
		  },
		  setClockMode: {
			name: 'Set Clock Mode (POTS)',
			description: 'Set the clock mode for POTS (Plain Old Telephone Service) operation.',
			options: [
			  {
				type: 'dropdown',
				label: 'Clock Mode',
				id: 'clk',
				default: '0',
				choices: [
				  { id: '0', label: 'Standard' },
				  { id: '1', label: 'Free' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#CLK=${event.options.clk}`);
				instance.log('info', `Clock mode set to ${event.options.clk}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set clock mode: ${error.message}`);
			  }
			}
		  },
		  setLineLevel: {
			name: 'Set Line Level (POTS)',
			description: 'Set the output line level for POTS operation.',
			options: [
			  {
				type: 'dropdown',
				label: 'Line Level',
				id: 'lev',
				default: '0',
				choices: [
				  { id: '0', label: '0 dBm' },
				  { id: '1', label: '-3 dBm' },
				  { id: '2', label: '-6 dBm' },
				  { id: '3', label: '-9 dBm' },
				  { id: '4', label: '-10 dBm' },
				  { id: '5', label: '-13 dBm' },
				  { id: '6', label: '-16 dBm' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#LEV=${event.options.lev}`);
				instance.log('info', `Line level set to ${event.options.lev}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set line level: ${error.message}`);
			  }
			}
		  },
		  setSpeed: {
			name: 'Set Speed (POTS)',
			description: 'Set the speed mode for POTS operation.',
			options: [
			  {
				type: 'dropdown',
				label: 'Speed',
				id: 'spd',
				default: '0',
				choices: [
				  { id: '0', label: 'Auto' },
				  { id: '1', label: 'Fixed' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#SPD=${event.options.spd}`);
				instance.log('info', `Speed set to ${event.options.spd}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set speed: ${error.message}`);
			  }
			}
		  },
		  setDataChannel: {
			name: 'Set Data Channel',
			description: 'Enable or disable the data channel for serial communication.',
			options: [
			  {
				type: 'dropdown',
				label: 'Data Channel',
				id: 'cda',
				default: '0',
				choices: [
				  { id: '0', label: 'Disable' },
				  { id: '1', label: 'Enable' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#CDA=${event.options.cda}`);
				instance.log('info', `Data channel set to ${event.options.cda}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set data channel: ${error.message}`);
			  }
			}
		  },
		  setBaudRate: {
			name: 'Set Data Channel Baud Rate',
			description: 'Set the baud rate for the data channel.',
			options: [
			  {
				type: 'dropdown',
				label: 'Baud Rate',
				id: 'bau',
				default: '0',
				choices: [
				  { id: '0', label: '300' },
				  { id: '1', label: '1200' },
				  { id: '2', label: '2400' },
				  { id: '3', label: '4800' },
				  { id: '4', label: '9600' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#BAU=${event.options.bau}`);
				instance.log('info', `Baud rate set to ${event.options.bau}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set baud rate: ${error.message}`);
			  }
			}
		  },
		  setRelayTransmission: {
			name: 'Set Relay Transmission',
			description: 'Enable or disable relay transmission for the device.',
			options: [
			  {
				type: 'dropdown',
				label: 'Relay Transmission',
				id: 'rel',
				default: '0',
				choices: [
				  { id: '0', label: 'Disabled' },
				  { id: '1', label: 'Active' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#REL=${event.options.rel}`);
				instance.log('info', `Relay transmission set to ${event.options.rel}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set relay transmission: ${error.message}`);
			  }
			}
		  },
		  setGPI: {
			name: 'Set GPI State',
			description: 'Set the state (open/closed) of the General Purpose Input (GPI) channel.',
			options: [
			  {
				type: 'dropdown',
				label: 'Channel',
				id: 'channel',
				default: '1',
				choices: [
				  { id: '1', label: '1' },
				  { id: '2', label: '2' }
				]
			  },
			  {
				type: 'dropdown',
				label: 'State',
				id: 'state',
				default: '0',
				choices: [
				  { id: '0', label: 'Open' },
				  { id: '1', label: 'Closed' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#GPI${event.options.channel}=${event.options.state}`);
				instance.log('info', `GPI${event.options.channel} set to ${event.options.state}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set GPI: ${error.message}`);
			  }
			}
		  },
		  setGPO: {
			name: 'Set GPO State',
			description: 'Set the state (open/closed) of the General Purpose Output (GPO) channel.',
			options: [
			  {
				type: 'dropdown',
				label: 'Channel',
				id: 'channel',
				default: '1',
				choices: [
				  { id: '1', label: '1' },
				  { id: '2', label: '2' }
				]
			  },
			  {
				type: 'dropdown',
				label: 'State',
				id: 'state',
				default: '0',
				choices: [
				  { id: '0', label: 'Open' },
				  { id: '1', label: 'Closed' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#GPO${event.options.channel}=${event.options.state}`);
				instance.log('info', `GPO${event.options.channel} set to ${event.options.state}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set GPO: ${error.message}`);
			  }
			}
		  },
		  setAuxAudioChannel: {
			name: 'Set Auxiliary 3 kHz Audio Channel',
			description: 'Enable or disable the auxiliary 3 kHz audio channel.',
			options: [
			  {
				type: 'dropdown',
				label: 'Auxiliary Channel',
				id: 'vor',
				default: '0',
				choices: [
				  { id: '0', label: 'Disabled' },
				  { id: '1', label: 'Enabled' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#VOR=${event.options.vor}`);
				instance.log('info', `Auxiliary 3 kHz audio channel set to ${event.options.vor}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set auxiliary audio channel: ${error.message}`);
			  }
			}
		  },
		  setSMS: {
			name: 'Display Text Message',
			description: 'Send a text message to be displayed on the device.',
			options: [
			  {
				type: 'textinput',
				label: 'Text Message',
				id: 'sms',
				default: '',
				required: true
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#SMS=\"${event.options.sms.replace(/"/g, '')}\"`);
				instance.log('info', `Text message sent: ${event.options.sms}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to send text message: ${error.message}`);
			  }
			}
		  },
		  setAudioInterfaceFormat: {
			name: 'Set Audio Interface Format',
			description: 'Select the audio interface format (analogue or AES/EBU).',
			options: [
			  {
				type: 'dropdown',
				label: 'Audio Interface Format',
				id: 'typ',
				default: '0',
				choices: [
				  { id: '0', label: 'Analogue' },
				  { id: '1', label: 'AES/EBU async' },
				  { id: '2', label: 'AES/EBU 32kHz' },
				  { id: '3', label: 'AES/EBU 48kHz' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#TYP=${event.options.typ}`);
				instance.log('info', `Audio interface format set to ${event.options.typ}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set audio interface format: ${error.message}`);
			  }
			}
		  },
		  setAESSync: {
			name: 'Set AES Sync Mode',
			description: 'Set the AES synchronization mode (genlock or master).',
			options: [
			  {
				type: 'dropdown',
				label: 'AES Sync Mode',
				id: 'sync',
				default: '0',
				choices: [
				  { id: '0', label: 'Genlock' },
				  { id: '1', label: 'Master' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#SYNC=${event.options.sync}`);
				instance.log('info', `AES sync mode set to ${event.options.sync}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set AES sync mode: ${error.message}`);
			  }
			}
		  },
		  setAESSamplingRate: {
			name: 'Set AES Nominal Sampling Rate',
			description: 'Set the nominal sampling rate for the AES interface.',
			options: [
			  {
				type: 'dropdown',
				label: 'AES Sampling Rate',
				id: 'aes',
				default: '0',
				choices: [
				  { id: '0', label: '32kHz' },
				  { id: '1', label: '48kHz' },
				  { id: '2', label: '96kHz' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#AES=${event.options.aes}`);
				instance.log('info', `AES sampling rate set to ${event.options.aes}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set AES sampling rate: ${error.message}`);
			  }
			}
		  },
		  setInputImpedance: {
			name: 'Set Input Impedance',
			description: 'Set the input impedance for the analogue audio input.',
			options: [
			  {
				type: 'dropdown',
				label: 'Input Impedance',
				id: 'zin',
				default: '0',
				choices: [
				  { id: '0', label: 'Low (600 Ohm)' },
				  { id: '1', label: 'High' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#ZIN=${event.options.zin}`);
				instance.log('info', `Input impedance set to ${event.options.zin}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set input impedance: ${error.message}`);
			  }
			}
		  },
		  setOutputLoad: {
			name: 'Set Output Load',
			description: 'Set the output load impedance for the analogue audio output.',
			options: [
			  {
				type: 'dropdown',
				label: 'Output Load',
				id: 'imp',
				default: '0',
				choices: [
				  { id: '0', label: 'Low (600 Ohm)' },
				  { id: '1', label: 'High' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#IMP=${event.options.imp}`);
				instance.log('info', `Output load set to ${event.options.imp}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set output load: ${error.message}`);
			  }
			}
		  },
		  setChannelPanning: {
			name: 'Set Channel Panning Mode',
			description: 'Set the panning mode for stereo channels.',
			options: [
			  {
				type: 'dropdown',
				label: 'Panning Mode',
				id: 'cpm',
				default: '0',
				choices: [
				  { id: '0', label: 'Full left/right' },
				  { id: '1', label: 'Half left/right' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#CPM=${event.options.cpm}`);
				instance.log('info', `Channel panning mode set to ${event.options.cpm}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set channel panning mode: ${error.message}`);
			  }
			}
		  },
		  setOutputSignal: {
			name: 'Set Output Signal Selection',
			description: 'Select the output signal routing (send, receive, or mix).',
			options: [
			  {
				type: 'dropdown',
				label: 'Output Signal',
				id: 'osel',
				default: '0',
				choices: [
				  { id: '0', label: 'Send signal' },
				  { id: '1', label: 'Receive signal' },
				  { id: '2', label: 'Send/Receive mix' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#OSEL=${event.options.osel}`);
				instance.log('info', `Output signal selection set to ${event.options.osel}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set output signal selection: ${error.message}`);
			  }
			}
		  },
		  setInputPad: {
			name: 'Set Input Attenuation Pad',
			description: 'Enable or disable the input attenuation pad for the specified channel.',
			options: [
			  {
				type: 'dropdown',
				label: 'Channel',
				id: 'channel',
				default: '3',
				choices: [
				  { id: '3', label: '3' }
				]
			  },
			  {
				type: 'dropdown',
				label: 'Pad Status',
				id: 'pad',
				default: '0',
				choices: [
				  { id: '0', label: 'No pad' },
				  { id: '1', label: 'Pad active' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#PAD${event.options.channel}=${event.options.pad}`);
				instance.log('info', `Input pad for channel ${event.options.channel} set to ${event.options.pad}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set input pad: ${error.message}`);
			  }
			}
		  },
		  setHeadphoneRouting: {
			name: 'Set Headphone Coordination Channel Routing',
			description: 'Configure routing of the coordination channel to headphone outputs.',
			options: [
			  {
				type: 'dropdown',
				label: 'Headphone Output',
				id: 'channel',
				default: '1',
				choices: [
				  { id: '1', label: '1' },
				  { id: '2', label: '2' }
				]
			  },
			  {
				type: 'dropdown',
				label: 'Routing Mode',
				id: 'routing',
				default: '0',
				choices: [
				  { id: '0', label: 'Program only' },
				  { id: '1', label: 'Coordination only' },
				  { id: '2', label: 'Program left, Coordination right' }
				]
			  }
			],
			callback: async (event) => {
			  if (!instance.socket?.isConnected) return;
			  try {
				await instance.sendCommand(`AT#CCR${event.options.channel}=${event.options.routing}`);
				instance.log('info', `Headphone output ${event.options.channel} routing set to ${event.options.routing}`);
				instance.debouncedRefreshData();
			  } catch (error) {
				instance.log('error', `Failed to set headphone routing: ${error.message}`);
			  }
			}
		  },
	  };
	},
  };