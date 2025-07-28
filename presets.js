
const { combineRgb } = require('@companion-module/base')
const ICONS = require('./icons.js').default || require('./icons.js')

function GetPresetsList() {
  const presets = {}
  presets['dial_and_hangup'] = {
    category: 'Keypad',
    name: 'Dial & Hang Up',
    type: 'button',
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
      category: 'Keypad',
      name: `Key ${i}`,
      type: 'button',
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
    category: 'Keypad',
    name: 'Clear',
    type: 'button',
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
  return presets
}

module.exports = { GetPresetsList }
