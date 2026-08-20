const { combineRgb } = require('@companion-module/base')
const ICONS = require('./icons.js').default || require('./icons.js')

function GetPresetsList() {
	const presets = {}

	// ---------------------------------------------------------
	// 1. Audio Level VU Meters (Preset Alternatives: Layered Gauge & Simple Fallback)
	// ---------------------------------------------------------

	// Stereo Tx Level Meter
	presets['vu_meter_tx'] = {
		type: 'alternatives',
		variants: [
			{
				type: 'layered',
				name: 'Tx VU Meter (Stereo)',
				keywords: ['audio', 'vu', 'meter', 'tx', 'transmit', 'stereo', 'level'],
				elements: [
					{
						type: 'box',
						x: 0,
						y: 0,
						width: 100,
						height: 100,
						color: combineRgb(0, 0, 0),
					},
					{
						type: 'text',
						x: 0,
						y: 4,
						width: 100,
						height: 16,
						text: 'TX LEVEL',
						fontsize: 60,
						weight: 'bold',
						color: combineRgb(255, 255, 255),
						halign: 'center',
					},
					{
						type: 'gauge',
						id: 'gauge_tx_l',
						x: 10,
						y: 22,
						width: 35,
						height: 56,
						orientation: 'vertical',
						min: -60,
						max: 0,
						origin: -60,
						fillEnabled: true,
						value: { isExpression: true, value: '$(aetaaudio-codecs:audioLevelTxLeft)' },
						stops: [
							{ value: -60, color: combineRgb(0, 200, 0), gradient: true },
							{ value: -18, color: combineRgb(255, 200, 0), gradient: true },
							{ value: 0, color: combineRgb(255, 0, 0), gradient: true },
						],
					},
					{
						type: 'gauge',
						id: 'gauge_tx_r',
						x: 55,
						y: 22,
						width: 35,
						height: 56,
						orientation: 'vertical',
						min: -60,
						max: 0,
						origin: -60,
						fillEnabled: true,
						value: { isExpression: true, value: '$(aetaaudio-codecs:audioLevelTxRight)' },
						stops: [
							{ value: -60, color: combineRgb(0, 200, 0), gradient: true },
							{ value: -18, color: combineRgb(255, 200, 0), gradient: true },
							{ value: 0, color: combineRgb(255, 0, 0), gradient: true },
						],
					},
					{
						type: 'text',
						x: 10,
						y: 80,
						width: 35,
						height: 16,
						text: 'L',
						fontsize: 70,
						color: combineRgb(255, 255, 255),
						halign: 'center',
					},
					{
						type: 'text',
						x: 55,
						y: 80,
						width: 35,
						height: 16,
						text: 'R',
						fontsize: 70,
						color: combineRgb(255, 255, 255),
						halign: 'center',
					},
				],
				steps: [],
				feedbacks: [],
			},
			{
				type: 'simple',
				name: 'Tx VU Meter (Stereo)',
				keywords: ['audio', 'vu', 'meter', 'tx', 'transmit', 'stereo', 'level'],
				style: {
					text: 'TX VU\\nL: $(aetaaudio-codecs:audioLevelTxLeft) dB\\nR: $(aetaaudio-codecs:audioLevelTxRight) dB',
					size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [],
				feedbacks: [
					{
						feedbackId: 'vuMeter',
						options: { type: 'txLeft' },
					},
				],
			},
		],
	}

	// Stereo Rx Level Meter
	presets['vu_meter_rx'] = {
		type: 'alternatives',
		variants: [
			{
				type: 'layered',
				name: 'Rx VU Meter (Stereo)',
				keywords: ['audio', 'vu', 'meter', 'rx', 'receive', 'stereo', 'level'],
				elements: [
					{
						type: 'box',
						x: 0,
						y: 0,
						width: 100,
						height: 100,
						color: combineRgb(0, 0, 0),
					},
					{
						type: 'text',
						x: 0,
						y: 4,
						width: 100,
						height: 16,
						text: 'RX LEVEL',
						fontsize: 60,
						weight: 'bold',
						color: combineRgb(255, 255, 255),
						halign: 'center',
					},
					{
						type: 'gauge',
						id: 'gauge_rx_l',
						x: 10,
						y: 22,
						width: 35,
						height: 56,
						orientation: 'vertical',
						min: -60,
						max: 0,
						origin: -60,
						fillEnabled: true,
						value: { isExpression: true, value: '$(aetaaudio-codecs:audioLevelRxLeft)' },
						stops: [
							{ value: -60, color: combineRgb(0, 200, 0), gradient: true },
							{ value: -18, color: combineRgb(255, 200, 0), gradient: true },
							{ value: 0, color: combineRgb(255, 0, 0), gradient: true },
						],
					},
					{
						type: 'gauge',
						id: 'gauge_rx_r',
						x: 55,
						y: 22,
						width: 35,
						height: 56,
						orientation: 'vertical',
						min: -60,
						max: 0,
						origin: -60,
						fillEnabled: true,
						value: { isExpression: true, value: '$(aetaaudio-codecs:audioLevelRxRight)' },
						stops: [
							{ value: -60, color: combineRgb(0, 200, 0), gradient: true },
							{ value: -18, color: combineRgb(255, 200, 0), gradient: true },
							{ value: 0, color: combineRgb(255, 0, 0), gradient: true },
						],
					},
					{
						type: 'text',
						x: 10,
						y: 80,
						width: 35,
						height: 16,
						text: 'L',
						fontsize: 70,
						color: combineRgb(255, 255, 255),
						halign: 'center',
					},
					{
						type: 'text',
						x: 55,
						y: 80,
						width: 35,
						height: 16,
						text: 'R',
						fontsize: 70,
						color: combineRgb(255, 255, 255),
						halign: 'center',
					},
				],
				steps: [],
				feedbacks: [],
			},
			{
				type: 'simple',
				name: 'Rx VU Meter (Stereo)',
				keywords: ['audio', 'vu', 'meter', 'rx', 'receive', 'stereo', 'level'],
				style: {
					text: 'RX VU\\nL: $(aetaaudio-codecs:audioLevelRxLeft) dB\\nR: $(aetaaudio-codecs:audioLevelRxRight) dB',
					size: '14',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [],
				feedbacks: [
					{
						feedbackId: 'vuMeter',
						options: { type: 'rxLeft' },
					},
				],
			},
		],
	}

	// Single Tx Left Meter
	presets['vu_meter_tx_left'] = {
		type: 'alternatives',
		variants: [
			{
				type: 'layered',
				name: 'Tx Left VU Meter',
				keywords: ['audio', 'vu', 'meter', 'tx', 'left', 'level'],
				elements: [
					{
						type: 'box',
						x: 0,
						y: 0,
						width: 100,
						height: 100,
						color: combineRgb(0, 0, 0),
					},
					{
						type: 'text',
						x: 0,
						y: 4,
						width: 100,
						height: 16,
						text: 'TX LEFT',
						fontsize: 60,
						weight: 'bold',
						color: combineRgb(255, 255, 255),
						halign: 'center',
					},
					{
						type: 'gauge',
						id: 'gauge_tx_mono_l',
						x: 25,
						y: 22,
						width: 50,
						height: 56,
						orientation: 'vertical',
						min: -60,
						max: 0,
						origin: -60,
						fillEnabled: true,
						value: { isExpression: true, value: '$(aetaaudio-codecs:audioLevelTxLeft)' },
						stops: [
							{ value: -60, color: combineRgb(0, 200, 0), gradient: true },
							{ value: -18, color: combineRgb(255, 200, 0), gradient: true },
							{ value: 0, color: combineRgb(255, 0, 0), gradient: true },
						],
					},
					{
						type: 'text',
						x: 0,
						y: 80,
						width: 100,
						height: 16,
						text: '$(aetaaudio-codecs:audioLevelTxLeft) dB',
						fontsize: 12,
						color: combineRgb(255, 255, 255),
						halign: 'center',
					},
				],
				steps: [],
				feedbacks: [],
			},
			{
				type: 'simple',
				name: 'Tx Left VU Meter',
				keywords: ['audio', 'vu', 'meter', 'tx', 'left', 'level'],
				style: {
					text: 'TX L\\n$(aetaaudio-codecs:audioLevelTxLeft) dB',
					size: '18',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [],
				feedbacks: [
					{
						feedbackId: 'vuMeter',
						options: { type: 'txLeft' },
					},
				],
			},
		],
	}

	// Single Rx Left Meter
	presets['vu_meter_rx_left'] = {
		type: 'alternatives',
		variants: [
			{
				type: 'layered',
				name: 'Rx Left VU Meter',
				keywords: ['audio', 'vu', 'meter', 'rx', 'left', 'level'],
				elements: [
					{
						type: 'box',
						x: 0,
						y: 0,
						width: 100,
						height: 100,
						color: combineRgb(0, 0, 0),
					},
					{
						type: 'text',
						x: 0,
						y: 4,
						width: 100,
						height: 16,
						text: 'RX LEFT',
						fontsize: 60,
						weight: 'bold',
						color: combineRgb(255, 255, 255),
						halign: 'center',
					},
					{
						type: 'gauge',
						id: 'gauge_rx_mono_l',
						x: 25,
						y: 22,
						width: 50,
						height: 56,
						orientation: 'vertical',
						min: -60,
						max: 0,
						origin: -60,
						fillEnabled: true,
						value: { isExpression: true, value: '$(aetaaudio-codecs:audioLevelRxLeft)' },
						stops: [
							{ value: -60, color: combineRgb(0, 200, 0), gradient: true },
							{ value: -18, color: combineRgb(255, 200, 0), gradient: true },
							{ value: 0, color: combineRgb(255, 0, 0), gradient: true },
						],
					},
					{
						type: 'text',
						x: 0,
						y: 80,
						width: 100,
						height: 16,
						text: '$(aetaaudio-codecs:audioLevelRxLeft) dB',
						fontsize: 12,
						color: combineRgb(255, 255, 255),
						halign: 'center',
					},
				],
				steps: [],
				feedbacks: [],
			},
			{
				type: 'simple',
				name: 'Rx Left VU Meter',
				keywords: ['audio', 'vu', 'meter', 'rx', 'left', 'level'],
				style: {
					text: 'RX L\\n$(aetaaudio-codecs:audioLevelRxLeft) dB',
					size: '18',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [],
				feedbacks: [
					{
						feedbackId: 'vuMeter',
						options: { type: 'rxLeft' },
					},
				],
			},
		],
	}

	// ---------------------------------------------------------
	// 2. Call Control Preset (Keypad)
	// ---------------------------------------------------------

	presets['dial_and_hangup'] = {
		type: 'simple',
		name: 'Dial & Hang Up',
		keywords: ['call', 'dial', 'hangup', 'phone', 'sip'],
		style: {
			text: '',
			size: '18',
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
			png64: ICONS.CALL,
			show_topbar: false,
		},
		steps: [
			{
				down: [
					{
						actionId: 'dial',
						options: { number: '' },
					},
				],
				up: [],
			},
			{
				down: [
					{
						actionId: 'hangup',
						options: {},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	// ---------------------------------------------------------
	// 3. Keypad Presets
	// ---------------------------------------------------------

	for (let i = 0; i <= 9; i++) {
		presets[`keypad_${i}`] = {
			type: 'simple',
			name: `Key ${i}`,
			keywords: ['keypad', 'dial', `${i}`],
			style: {
				text: `${i}`,
				size: '24',
				show_topbar: false,
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
				png64: ICONS.KEY,
			},
			steps: [
				{
					down: [
						{
							actionId: 'keypad',
							options: { key: `${i}`, clear: false },
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	}

	presets['keypad_clear'] = {
		type: 'simple',
		name: 'Clear Keypad',
		keywords: ['keypad', 'clear', 'reset'],
		style: {
			text: '',
			size: '24',
			show_topbar: false,
			color: combineRgb(255, 255, 255),
			bgcolor: combineRgb(0, 0, 0),
			png64: ICONS.BACKSPACE,
		},
		steps: [
			{
				down: [
					{
						actionId: 'keypad',
						options: { key: '', clear: true },
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	// ---------------------------------------------------------
	// 4. Preset Category Structure
	// ---------------------------------------------------------

	const structure = [
		{
			id: 'keypad_section',
			name: 'Keypad',
			definitions: [
				{
					id: 'keypad_group',
					type: 'simple',
					name: 'Keypad Actions',
					presets: [
						'dial_and_hangup',
						'keypad_1',
						'keypad_2',
						'keypad_3',
						'keypad_4',
						'keypad_5',
						'keypad_6',
						'keypad_7',
						'keypad_8',
						'keypad_9',
						'keypad_clear',
						'keypad_0',
					],
				},
			],
		},
		{
			id: 'audio_meters_section',
			name: 'Audio VU Meters',
			definitions: [
				{
					id: 'vu_meters_group',
					type: 'simple',
					name: 'VU Meters',
					presets: ['vu_meter_tx', 'vu_meter_rx', 'vu_meter_tx_left', 'vu_meter_rx_left'],
				},
			],
		},
	]

	return { structure, presets }
}

module.exports = { GetPresetsList }
