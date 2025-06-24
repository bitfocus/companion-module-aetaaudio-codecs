module.exports = {
	initVariables() {
	  this.setVariableDefinitions([
		{ variableId: 'connectionStatus', name: 'Connection Status' },
		{ variableId: 'codecModel', name: 'Codec Model' }, // From ATI response
		{ variableId: '5AS', name: '5A System Status' }, // AT#5AS
		{ variableId: 'codingAlgorithm', name: 'Coding Algorithm' }, // AT#COD
		{ variableId: 'networkType', name: 'Network Type' }, // AT#NET
		{ variableId: 'ipQuality', name: 'IP Quality' }, // AT#IPQ
		{ variableId: 'packetReplication', name: 'Packet Replication' }, // AT#REP
		{ variableId: 'codingBitRate', name: 'Coding Bit Rate' }, // AT#CHD
		{ variableId: 'frequency', name: 'Coding Frequency' }, // AT#FRE
		{ variableId: 'inputGain', name: 'Input Gain' }, // AT#GIN
		{ variableId: 'outputGain', name: 'Output Gain' }, // AT#GOUT
		{ variableId: 'localEcho', name: 'Local Echo' }, // ATE
		{ variableId: 'dialMethod', name: 'Dial Method' }, // AT#DIA
		{ variableId: 'dialTone', name: 'Dial Tone' }, // AT#TON
		{ variableId: 'callFiltering', name: 'Call Filtering' }, // AT#TAE
		{ variableId: 'proprietaryFilter', name: 'Proprietary ISDN Filter' }, // AT#TFS
		{ variableId: 'hlc', name: 'HLC Enabling' }, // AT#HLC
		{ variableId: 'autoRedial', name: 'Auto Redial' }, // AT#RED
		{ variableId: 'redialRetries', name: 'Redial Retries' }, // AT#NBR
		{ variableId: 'redialWaitTime', name: 'Redial Wait Time' }, // AT#TTR
		{ variableId: 'loopControl', name: 'Loop Control' }, // AT#LCT
		{ variableId: 'backupNetwork', name: 'Backup Network' }, // AT#LLBC
		{ variableId: 'passiveBackupMode', name: 'Passive Backup Mode' }, // AT#LLBR
		{ variableId: 'dhcp', name: 'DHCP Mode' }, // AT#DHCP
		{ variableId: 'ipAddress', name: 'IP Address' }, // AT#IP
		{ variableId: 'ipMask', name: 'IP Mask' }, // AT#IPM
		{ variableId: 'gateway', name: 'Gateway' }, // AT#GW
		{ variableId: 'dns', name: 'DNS' }, // AT#DNS
		{ variableId: 'originalCopy', name: 'Original/Copy Field' }, // AT#ORI
		{ variableId: 'copyright', name: 'Copyright Field' }, // AT#COP
		{ variableId: 'errorCorrection', name: 'Error Correction' }, // AT#COR
		{ variableId: 'clockMode', name: 'Clock Mode' }, // AT#CLK
		{ variableId: 'lineLevel', name: 'Line Level' }, // AT#LEV
		{ variableId: 'speed', name: 'Speed' }, // AT#SPD
		{ variableId: 'dataChannel', name: 'Data Channel' }, // AT#CDA
		{ variableId: 'baudRate', name: 'Baud Rate' }, // AT#BAU
		{ variableId: 'relayTransmission', name: 'Relay Transmission' }, // AT#REL
		{ variableId: 'gpi1', name: 'GPI 1 State' }, // AT#GPI1
		{ variableId: 'gpi2', name: 'GPI 2 State' }, // AT#GPI2
		{ variableId: 'gpo1', name: 'GPO 1 State' }, // AT#GPO1
		{ variableId: 'gpo2', name: 'GPO 2 State' }, // AT#GPO2
		{ variableId: 'auxAudioChannel', name: 'Auxiliary Audio Channel' }, // AT#VOR
		{ variableId: 'audioInterfaceFormat', name: 'Audio Interface Format' }, // AT#TYP
		{ variableId: 'aesSyncMode', name: 'AES Sync Mode' }, // AT#SYNC
		{ variableId: 'aesSamplingRate', name: 'AES Sampling Rate' }, // AT#AES
		{ variableId: 'inputImpedance', name: 'Input Impedance' }, // AT#ZIN
		{ variableId: 'outputLoad', name: 'Output Load' }, // AT#IMP
		{ variableId: 'channelPanning', name: 'Channel Panning' }, // AT#CPM
		{ variableId: 'outputSignal', name: 'Output Signal' }, // AT#OSEL
		{ variableId: 'inputPad', name: 'Input Pad' }, // AT#PADi
		{ variableId: 'headphoneRouting', name: 'Headphone Routing' }, // AT#CCRi
		{ variableId: 'smsMessage', name: 'Last SMS Message' }, // AT#SMS
		// Call status variables
		{ variableId: 'ringing', name: 'Ringing Status' },
		{ variableId: 'calling', name: 'Calling Status' },
		{ variableId: 'established', name: 'Established Status' },
		{ variableId: 'released', name: 'Released Status' },
		{ variableId: 'codecStatus', name: 'Codec Status' }, // AT#SUP COD1:S=
		{ variableId: 'incomingCall', name: 'Incoming Call' }, // AT#SUP ENT:APPEL1=
		{ variableId: 'activeAlarms', name: 'Active Alarms' },
		{ variableId: 'lastError', name: 'Last Error Message' },
		{ variableId: 'audioStatus', name: 'Audio Status' },
		{ variableId: 'jitterBuffer', name: 'Jitter Buffer Status' },
		{ variableId: 'audioLevel', name: 'Audio Level' },
		{ variableId: 'lastConnectedNumber', name: 'Last Connected Number' },
		// Dial/Location numbers (keep for compatibility)
		{ variableId: 'number1', name: 'Dial Number 1' },
		{ variableId: 'number2', name: 'Dial Number 2' },
		{ variableId: 'number3', name: 'Dial Number 3' },
		{ variableId: 'number4', name: 'Dial Number 4' },
		{ variableId: 'number5', name: 'Dial Number 5' },
		{ variableId: 'number6', name: 'Dial Number 6' },
		{ variableId: 'number7', name: 'Dial Number 7' },
		{ variableId: 'number8', name: 'Dial Number 8' },
		{ variableId: 'location1', name: 'Local Number 1' },
		{ variableId: 'location2', name: 'Local Number 2' },
		{ variableId: 'location3', name: 'Local Number 3' },
		{ variableId: 'location4', name: 'Local Number 4' },
		{ variableId: 'location5', name: 'Local Number 5' },
		{ variableId: 'location6', name: 'Local Number 6' },
		{ variableId: 'location7', name: 'Local Number 7' },
		{ variableId: 'location8', name: 'Local Number 8' },
		// Config and alarm bytes
		{ variableId: 'configNumber', name: 'Configuration Number' },
		{ variableId: 'testLoop', name: 'Test Loop Status' },
		{ variableId: 'alarmD1', name: 'Alarm Byte 1' },
		{ variableId: 'alarmD2', name: 'Alarm Byte 2' },
		{ variableId: 'alarmD3', name: 'Alarm Byte 3' }
	  ]);
  
	  this.setVariableValues({
		connectionStatus: 'Disconnected',
		codecModel: 'Unknown',
		'5AS': 'Unknown',
		codingAlgorithm: 'Unknown',
		networkType: 'Unknown',
		ipQuality: 'Unknown',
		packetReplication: 'Unknown',
		codingBitRate: 'Unknown',
		frequency: 'Unknown',
		inputGain: 'Unknown',
		outputGain: 'Unknown',
		localEcho: 'Unknown',
		dialMethod: 'Unknown',
		dialTone: 'Unknown',
		callFiltering: 'Unknown',
		proprietaryFilter: 'Unknown',
		hlc: 'Unknown',
		autoRedial: 'Unknown',
		redialRetries: 'Unknown',
		redialWaitTime: 'Unknown',
		loopControl: 'Unknown',
		backupNetwork: 'Unknown',
		passiveBackupMode: 'Unknown',
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
		speed: 'Unknown',
		dataChannel: 'Unknown',
		baudRate: 'Unknown',
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
		headphoneRouting: 'Unknown',
		smsMessage: '',
		ringing: 'False',
		calling: 'False',
		established: 'False',
		released: 'False',
		codecStatus: 'Unknown',
		incomingCall: 'Unknown',
		activeAlarms: 'Unknown',
		lastError: '',
		audioStatus: 'Unknown',
		jitterBuffer: 'Unknown',
		audioLevel: 'Unknown',
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
		alarmD3: 'Unknown'
	  });
	},
  };