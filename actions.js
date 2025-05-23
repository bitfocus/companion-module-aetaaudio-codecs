module.exports = {
	getActionDefinitions(instance) {
	  return {
		dial: {
		  name: 'Dial Number',
		  options: [
			{
			  type: 'textinput',
			  label: 'Phone Number or SIP URI',
			  id: 'number',
			  default: '',
			  tooltip: 'Enter a phone number (e.g., 123456789) or SIP URI (e.g., sip:user@example.com)',
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
			const number = event.options.number;
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
		  options: [],
		  callback: async () => {
			instance.log('info', 'Refresh Data action triggered');
			instance.refreshData(); // Use immediate refresh for manual action
		  },
		 },
		monitorAudio: {
			name: 'Monitor Audio Levels',
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
		  }
	  };
	},
  };