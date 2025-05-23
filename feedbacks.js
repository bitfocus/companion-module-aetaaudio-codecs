const { combineRgb } = require('@companion-module/base');

module.exports = {
  getFeedbackDefinitions(instance) {
    return {
      codecConnected: {
        type: 'boolean',
        name: 'Codec Connected',
        description: 'Changes button color when codec is connected',
        defaultStyle: { bgcolor: combineRgb(0, 255, 0) },
        callback: (feedback) => {
          return instance.socket?.isConnected && !instance.socket.destroyed;
        },
      },
      ringing: {
        type: 'boolean',
        name: 'Ringing',
        description: 'Changes color when receiving incoming call',
        defaultStyle: { bgcolor: combineRgb(255, 255, 0) },
        callback: (feedback) => {
          return instance.feedbackState.ringing;
        },
      },
      calling: {
        type: 'boolean',
        name: 'Calling',
        description: 'Changes color when making outgoing call',
        defaultStyle: { bgcolor: combineRgb(0, 0, 255) },
        callback: (feedback) => {
          return instance.feedbackState.calling;
        },
      },
      established: {
        type: 'boolean',
        name: 'Call Established',
        description: 'Changes color when call is connected',
        defaultStyle: { bgcolor: combineRgb(0, 128, 0) },
        callback: (feedback) => {
          return instance.feedbackState.established;
        },
      },
      released: {
        type: 'boolean',
        name: 'Call Released',
        description: 'Changes color when call is released',
        defaultStyle: { bgcolor: combineRgb(255, 0, 0) },
        callback: (feedback) => {
          return instance.feedbackState.released;
        },
      },
      vuMeter: {
        type: 'advanced',
        name: 'VU Meter',
        description: 'Shows audio level when VU meter is enabled',
        defaultStyle: {
          bgcolor: combineRgb(0, 255, 0),
          color: combineRgb(255, 255, 255)
        },
        options: [
          {
            type: 'dropdown',
            label: 'Input/Output',
            id: 'type',
            default: 'input',
            choices: [
              { id: 'input', label: 'Input Level' },
              { id: 'output', label: 'Output Level' }
            ]
          }
        ],
        callback: (feedback) => {
          const level = feedback.options.type === 'input' ? 
            instance.audioLevels?.input || -60 : 
            instance.audioLevels?.output || -60;

          let bgcolor;
          if (level < -40) {
            bgcolor = combineRgb(0, 255, 0); // Normal level
          } else if (level < -20) {
            bgcolor = combineRgb(255, 255, 0); // Warning level
          } else if (level < -10) {
            bgcolor = combineRgb(255, 165, 0); // High level
          } else {
            bgcolor = combineRgb(255, 0, 0); // Peak level
          }

          return {
            bgcolor: bgcolor,
            text: `${level.toFixed(1)} dB`
          };
        }
      }
    };
  },
};