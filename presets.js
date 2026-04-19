
const { combineRgb } = require('@companion-module/base')
const ICONS = require('./icons.js').default || require('./icons.js')

function GetPresetsList() {
  const presets = {}
  presets['dial_and_hangup'] = {
    type: 'simple',
    name: 'Dial & Hang Up',
    style: {
      text: '',
      size: '18',
      color: combineRgb(255, 255, 255),
      bgcolor: combineRgb(0, 0, 0),
      png64: ICONS.CALL,
      show_topbar:false, // Change as needed
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
  for (let i = 0; i <= 9; i++) {
    presets[`keypad_${i}`] = {
      type: 'simple',
      name: `Key ${i}`,
      style: {
        text: `${i}`,
        size: '24',
        show_topbar:false,
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
    name: 'Clear',
    style: {
      text: '',
      size: '24',
      show_topbar:false,
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
             'keypad_1', 'keypad_2', 'keypad_3', 
             'keypad_4', 'keypad_5', 'keypad_6', 
             'keypad_7', 'keypad_8', 'keypad_9', 
             'keypad_clear', 'keypad_0'
          ],
        },
      ],
    },
  ]

  return { structure, presets }
}

module.exports = { GetPresetsList }
