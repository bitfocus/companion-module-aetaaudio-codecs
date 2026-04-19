module.exports = {
	initVariables() {
	  this.setVariableDefinitions({
		connectionStatus: { name: 'Connection Status' },
		codecModel: { name: 'Codec Model' }, // From ATI response
		'5AS': { name: '5A System Status' }, // AT#5AS
		codingAlgorithm: { name: 'Coding Algorithm' }, // AT#COD
		networkType: { name: 'Network Type' }, // AT#NET
		ipQuality: { name: 'IP Quality' }, // AT#IPQ
		packetReplication: { name: 'Packet Replication' }, // AT#REP
		codingBitRate: { name: 'Coding Bit Rate' }, // AT#CHD
		codingSamplingRate: { name: 'Coding Sampling Rate' }, // AT#FRE
		maxInputLevel: { name: 'Maximum Input Level' }, // AT#GIN
		maxOutputLevel: { name: 'Maximum Output Level' }, // AT#GOUT
		localEcho: { name: 'Local Echo' }, // ATE
		dialMethod: { name: 'Dial Method' }, // AT#DIA
		dialTone: { name: 'Dial Tone' }, // AT#TON
		incomingCallFilter: { name: 'Incoming Call Filter' }, // AT#TAE
		proprietaryFilter: { name: 'Proprietary ISDN Filter' }, // AT#TFS
		hlc: { name: 'HLC Enabling' }, // AT#HLC
		autoRedial: { name: 'Auto Redial' }, // AT#RED
		redialRetries: { name: 'Redial Retries' }, // AT#NBR
		redialWaitTime: { name: 'Redial Wait Time' }, // AT#TTR
		loopControlMode: { name: 'Loop Control Mode' }, // AT#LCT
		backupCallNetwork: { name: 'Backup Call Network' }, // AT#LLBC
		backupReceiveMode: { name: 'Backup Receive Mode' }, // AT#LLBR
		dhcp: { name: 'DHCP Mode' }, // AT#DHCP
		ipAddress: { name: 'IP Address' }, // AT#IP
		ipMask: { name: 'IP Mask' }, // AT#IPM
		gateway: { name: 'Gateway' }, // AT#GW
		dns: { name: 'DNS' }, // AT#DNS
		originalCopy: { name: 'Original/Copy Field' }, // AT#ORI
		copyright: { name: 'Copyright Field' }, // AT#COP
		errorCorrection: { name: 'Error Correction' }, // AT#COR
		clockMode: { name: 'Clock Mode' }, // AT#CLK
		lineLevel: { name: 'Line Level' }, // AT#LEV
		potsSpeed: { name: 'POTS Speed' }, // AT#SPD
		dataChannelEnabled: { name: 'Data Channel Enabled' }, // AT#CDA
		dataChannelBaudRate: { name: 'Data Channel Baud Rate' }, // AT#BAU
		relayTransmission: { name: 'Relay Transmission' }, // AT#REL
		gpi1: { name: 'GPI 1 State' }, // AT#GPI1
		gpi2: { name: 'GPI 2 State' }, // AT#GPI2
		gpo1: { name: 'GPO 1 State' }, // AT#GPO1
		gpo2: { name: 'GPO 2 State' }, // AT#GPO2
		auxAudioChannel: { name: 'Auxiliary Audio Channel' }, // AT#VOR
		audioInterfaceFormat: { name: 'Audio Interface Format' }, // AT#TYP
		aesSyncMode: { name: 'AES Sync Mode' }, // AT#SYNC
		aesSamplingRate: { name: 'AES Sampling Rate' }, // AT#AES
		inputImpedance: { name: 'Input Impedance' }, // AT#ZIN
		outputLoad: { name: 'Output Load' }, // AT#IMP
		channelPanning: { name: 'Channel Panning' }, // AT#CPM
		outputSignal: { name: 'Output Signal' }, // AT#OSEL
		inputPad: { name: 'Input Pad' }, // AT#PADi
		coordinationChannelRouting: { name: 'Coordination Channel Routing' }, // AT#CCRi
		smsMessage: { name: 'Last SMS Message' }, // AT#SMS
		// Audio Input Controls
		inputGainStep1: { name: 'Input 1 Gain Step' }, // AT#GIS1
		inputGainStep2: { name: 'Input 2 Gain Step' }, // AT#GIS2
		inputGainStep3: { name: 'Input 3 Gain Step' }, // AT#GIS3
		phantomPower1: { name: 'Input 1 Phantom Power' }, // AT#PWR1
		phantomPower2: { name: 'Input 2 Phantom Power' }, // AT#PWR2
		phantomPower3: { name: 'Input 3 Phantom Power' }, // AT#PWR3
		limiter1: { name: 'Input 1 Limiter' }, // AT#LIM1
		limiter2: { name: 'Input 2 Limiter' }, // AT#LIM2
		limiter3: { name: 'Input 3 Limiter' }, // AT#LIM3
		// Call status variables
		ringing: { name: 'Ringing Status' },
		calling: { name: 'Calling Status' },
		established: { name: 'Established Status' },
		released: { name: 'Released Status' },
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
	  });
  
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