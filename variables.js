module.exports = {
	initVariables() {
	  const variables = {
		connectionStatus: { name: 'Connection Status' },
		codecModel: { name: 'Codec Model' }, // From ATI response
		'5AS': { name: '5A System Status' }, // AT#5AS
		codingAlgorithm: { name: 'Coding Algorithm' }, // AT#COD
		networkType: { name: 'Network Type' }, // AT#NET
		ipQuality: { name: 'IP Quality' , models: ['S4', 'S5', 'S+', 'SxS']}, // AT#IPQ
		packetReplication: { name: 'Packet Replication' , models: ['S+', 'S5', 'SxS']}, // AT#REP
		codingBitRate: { name: 'Coding Bit Rate' }, // AT#CHD
		codingSamplingRate: { name: 'Coding Sampling Rate' }, // AT#FRE
		maxInputLevel: { name: 'Maximum Input Level' }, // AT#GIN
		maxOutputLevel: { name: 'Maximum Output Level' }, // AT#GOUT
		localEcho: { name: 'Local Echo' }, // ATE
		dialMethod: { name: 'Dial Method' , models: ['S+', 'S4', 'S5', 'SxS']}, // AT#DIA
		dialTone: { name: 'Dial Tone' , models: ['S+', 'S4', 'S5', 'SxS']}, // AT#TON
		incomingCallFilter: { name: 'Incoming Call Filter' }, // AT#TAE
		proprietaryFilter: { name: 'Proprietary ISDN Filter' , models: ['HS3', 'S3']}, // AT#TFS
		hlc: { name: 'HLC Enabling' , models: ['HS3', 'S3']}, // AT#HLC
		autoRedial: { name: 'Auto Redial' , models: ['S4', 'S5', 'S+', 'SxS']}, // AT#RED
		redialRetries: { name: 'Redial Retries' , models: ['S4', 'S5', 'S+', 'SxS']}, // AT#NBR
		redialWaitTime: { name: 'Redial Wait Time' , models: ['S4', 'S5', 'S+', 'SxS']}, // AT#TTR
		loopControlMode: { name: 'Loop Control Mode' , models: ['S4', 'S5', 'SxS']}, // AT#LCT
		backupCallNetwork: { name: 'Backup Call Network' , models: ['S4', 'S5', 'SxS']}, // AT#LLBC
		backupReceiveMode: { name: 'Backup Receive Mode' , models: ['S4', 'S5', 'SxS']}, // AT#LLBR
		dhcp: { name: 'DHCP Mode' , models: ['S4', 'S5', 'S+', 'SxS']}, // AT#DHCP
		ipAddress: { name: 'IP Address' , models: ['S4', 'S5', 'S+', 'SxS']}, // AT#IP
		ipMask: { name: 'IP Mask' , models: ['S4', 'S5', 'S+', 'SxS']}, // AT#IPM
		gateway: { name: 'Gateway' , models: ['S4', 'S5', 'S+', 'SxS']}, // AT#GW
		dns: { name: 'DNS' , models: ['S4', 'S5', 'S+', 'SxS']}, // AT#DNS
		originalCopy: { name: 'Original/Copy Field' , models: ['HS3', 'S3']}, // AT#ORI
		copyright: { name: 'Copyright Field' , models: ['HS3', 'S3']}, // AT#COP
		errorCorrection: { name: 'Error Correction' }, // AT#COR
		clockMode: { name: 'Clock Mode' , models: ['S+', 'S5', 'SxS']}, // AT#CLK
		lineLevel: { name: 'Line Level' , models: ['S+', 'S5', 'SxS']}, // AT#LEV
		potsSpeed: { name: 'POTS Speed' , models: ['S+', 'S4', 'S5', 'SxS']}, // AT#SPD
		dataChannelEnabled: { name: 'Data Channel Enabled' }, // AT#CDA
		dataChannelBaudRate: { name: 'Data Channel Baud Rate' }, // AT#BAU
		relayTransmission: { name: 'Relay Transmission' }, // AT#REL
		gpi1: { name: 'GPI 1 State' , models: ['S+', 'S4', 'S5', 'SxS']}, // AT#GPI1
		gpi2: { name: 'GPI 2 State' , models: ['S+', 'S4', 'S5', 'SxS']}, // AT#GPI2
		gpo1: { name: 'GPO 1 State' , models: ['S+', 'S4', 'S5', 'SxS']}, // AT#GPO1
		gpo2: { name: 'GPO 2 State' , models: ['S+', 'S4', 'S5', 'SxS']}, // AT#GPO2
		auxAudioChannel: { name: 'Auxiliary Audio Channel' , models: ['HS3', 'S3', 'S4', 'S5']}, // AT#VOR
		audioInterfaceFormat: { name: 'Audio Interface Format' , models: ['HS3', 'S3', 'S4', 'S5', 'SxS']}, // AT#TYP
		aesSyncMode: { name: 'AES Sync Mode' , models: ['S4', 'S5', 'SxS']}, // AT#SYNC
		aesSamplingRate: { name: 'AES Sampling Rate' , models: ['S4', 'S5', 'SxS']}, // AT#AES
		inputImpedance: { name: 'Input Impedance' , models: ['S4', 'S5', 'SxS']}, // AT#ZIN
		outputLoad: { name: 'Output Load' , models: ['HS3', 'S3']}, // AT#IMP
		channelPanning: { name: 'Channel Panning' , models: ['S+', 'SxS']}, // AT#CPM
		outputSignal: { name: 'Output Signal' , models: ['S+', 'SxS']}, // AT#OSEL
		inputPad: { name: 'Input Pad' , models: ['S+', 'SxS']}, // AT#PADi
		coordinationChannelRouting: { name: 'Coordination Channel Routing' , models: ['S+', 'SxS']}, // AT#CCRi
		smsMessage: { name: 'Last SMS Message' , models: ['S+', 'S4', 'S5', 'SxS']}, // AT#SMS
		// Audio Input Controls
		inputGainStep1: { name: 'Input 1 Gain Step' , models: ['S+', 'SxS']}, // AT#GIS1
		inputGainStep2: { name: 'Input 2 Gain Step' , models: ['S+', 'SxS']}, // AT#GIS2
		inputGainStep3: { name: 'Input 3 Gain Step' , models: ['S+', 'SxS']}, // AT#GIS3
		phantomPower1: { name: 'Input 1 Phantom Power' , models: ['S+', 'SxS']}, // AT#PWR1
		phantomPower2: { name: 'Input 2 Phantom Power' , models: ['S+', 'SxS']}, // AT#PWR2
		phantomPower3: { name: 'Input 3 Phantom Power' , models: ['S+', 'SxS']}, // AT#PWR3
		limiter1: { name: 'Input 1 Limiter' , models: ['S+', 'SxS']}, // AT#LIM1
		limiter2: { name: 'Input 2 Limiter' , models: ['S+', 'SxS']}, // AT#LIM2
		limiter3: { name: 'Input 3 Limiter' , models: ['S+', 'SxS']}, // AT#LIM3
		// Call status variables
		ringing: { name: 'Ringing Status' , models: ['S4', 'S5', 'SxS']},
		calling: { name: 'Calling Status' , models: ['S4', 'S5', 'SxS']},
		established: { name: 'Established Status' , models: ['S4', 'S5', 'SxS']},
		released: { name: 'Released Status' , models: ['S4', 'S5', 'SxS']},
		codecStatus: { name: 'Codec Status' }, // AT#SUP COD1:S=
		incomingCall: { name: 'Incoming Call' }, // AT#SUP ENT:APPEL1=
		activeAlarms: { name: 'Active Alarms' },
		lastError: { name: 'Last Error Message' },
		audioStatus: { name: 'Audio Status' },
		jitterBuffer: { name: 'Jitter Buffer Status' },
		audioLevel: { name: 'Audio Level' },
		audioLevelTxLeft: { name: 'Audio Level Tx Left' },
		audioLevelTxRight: { name: 'Audio Level Tx Right' },
		audioLevelRxLeft: { name: 'Audio Level Rx Left' },
		audioLevelRxRight: { name: 'Audio Level Rx Right' },
		lastConnectedNumber: { name: 'Last Connected Number' },
		// Dial/Location numbers (keep for compatibility)
		number1: { name: 'Dial Number 1' },
		number2: { name: 'Dial Number 2' },
		number3: { name: 'Dial Number 3' },
		number4: { name: 'Dial Number 4' },
		number5: { name: 'Dial Number 5' },
		number6: { name: 'Dial Number 6' },
		number7: { name: 'Dial Number 7' },
		number8: { name: 'Dial Number 8' },
		location1: { name: 'Local Number 1' },
		location2: { name: 'Local Number 2' },
		location3: { name: 'Local Number 3' },
		location4: { name: 'Local Number 4' },
		location5: { name: 'Local Number 5' },
		location6: { name: 'Local Number 6' },
		location7: { name: 'Local Number 7' },
		location8: { name: 'Local Number 8' },
		// Config and alarm bytes
		configNumber: { name: 'Configuration Number' },
		testLoop: { name: 'Test Loop Status' },
		alarmD1: { name: 'Alarm Byte 1' },
		alarmD2: { name: 'Alarm Byte 2' },
		alarmD3: { name: 'Alarm Byte 3' },
		keyPadInput: { name: 'Keypad Input' }
	  };

	  const selectedModel = this.config?.model || 'auto';
	  const filteredVariables = {};
	  for (const [id, variable] of Object.entries(variables)) {
		if (selectedModel === 'auto' || !variable.models || variable.models.includes(selectedModel)) {
		  filteredVariables[id] = variable;
		}
	  }

	  this.setVariableDefinitions(filteredVariables);
  
	  this.setVariableValues({
		connectionStatus: 'Disconnected',
		codecModel: 'Unknown',
		'5AS': 'Unknown',
		codingAlgorithm: 'Unknown',
		networkType: 'Unknown',
		ipQuality: 'Unknown',
		packetReplication: 'Unknown',
		codingBitRate: 'Unknown',
		codingSamplingRate: 'Unknown',
		maxInputLevel: 'Unknown',
		maxOutputLevel: 'Unknown',
		localEcho: 'Unknown',
		dialMethod: 'Unknown',
		dialTone: 'Unknown',
		incomingCallFilter: 'Unknown',
		proprietaryFilter: 'Unknown',
		hlc: 'Unknown',
		autoRedial: 'Unknown',
		redialRetries: 'Unknown',
		redialWaitTime: 'Unknown',
		loopControlMode: 'Unknown',
		backupCallNetwork: 'Unknown',
		backupReceiveMode: 'Unknown',
		dhcp: 'Unknown',
		ipAddress: 'Unknown',
		ipMask: 'Unknown',
		gateway: 'Unknown',
		dns: 'Unknown',
		originalCopy: 'Unknown',
		copyright: 'Unknown',
		errorCorrection: 'Unknown',
		clockMode: 'Unknown',
		lineLevel: 'Unknown',
		potsSpeed: 'Unknown',
		dataChannelEnabled: 'Unknown',
		dataChannelBaudRate: 'Unknown',
		relayTransmission: 'Unknown',
		gpi1: 'Unknown',
		gpi2: 'Unknown',
		gpo1: 'Unknown',
		gpo2: 'Unknown',
		auxAudioChannel: 'Unknown',
		audioInterfaceFormat: 'Unknown',
		aesSyncMode: 'Unknown',
		aesSamplingRate: 'Unknown',
		inputImpedance: 'Unknown',
		outputLoad: 'Unknown',
		channelPanning: 'Unknown',
		outputSignal: 'Unknown',
		inputPad: 'Unknown',
		coordinationChannelRouting: 'Unknown',
		smsMessage: '',
		inputGainStep1: 'Unknown',
		inputGainStep2: 'Unknown',
		inputGainStep3: 'Unknown',
		phantomPower1: 'Unknown',
		phantomPower2: 'Unknown',
		phantomPower3: 'Unknown',
		limiter1: 'Unknown',
		limiter2: 'Unknown',
		limiter3: 'Unknown',
		ringing: false,
		calling: false,
		established: false,
		released: false,
		codecStatus: 'Unknown',
		incomingCall: 'Unknown',
		activeAlarms: 'Unknown',
		lastError: '',
		audioStatus: 'Unknown',
		jitterBuffer: 'Unknown',
		audioLevel: 'Unknown',
		audioLevelTxLeft: 'Unknown',
		audioLevelTxRight: 'Unknown',
		audioLevelRxLeft: 'Unknown',
		audioLevelRxRight: 'Unknown',
		lastConnectedNumber: 'Unknown',
		number1: 'Unknown',
		number2: 'Unknown',
		number3: 'Unknown',
		number4: 'Unknown',
		number5: 'Unknown',
		number6: 'Unknown',
		number7: 'Unknown',
		number8: 'Unknown',
		location1: 'Unknown',
		location2: 'Unknown',
		location3: 'Unknown',
		location4: 'Unknown',
		location5: 'Unknown',
		location6: 'Unknown',
		location7: 'Unknown',
		location8: 'Unknown',
		configNumber: 'Unknown',
		testLoop: 'Unknown',
		alarmD1: 'Unknown',
		alarmD2: 'Unknown',
		alarmD3: 'Unknown',
		keyPadInput: ''
	  });
	},
  };