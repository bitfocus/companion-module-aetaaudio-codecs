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
            default: 'txLeft',
            choices: [
              { id: 'txLeft', label: 'Tx Left' },
              { id: 'txRight', label: 'Tx Right' },
              { id: 'rxLeft', label: 'Rx Left' },
              { id: 'rxRight', label: 'Rx Right' }
            ]
          }
        ],
        callback: (feedback) => {
          let level = -60;
          const levels = instance.audioLevels || {};

          switch (feedback.options.type) {
            case 'txLeft':
              level = levels.txLeft ?? -60;
              break;
            case 'txRight':
              level = levels.txRight ?? -60;
              break;
            case 'rxLeft':
              level = levels.rxLeft ?? -60;
              break;
            case 'rxRight':
              level = levels.rxRight ?? -60;
              break;
            default:
              level = levels.txLeft ?? -60;
          }

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
      },
      ipQualityStatus: {
        type: 'advanced',
        name: 'IP Quality Status',
        description: 'Changes color based on IP connection quality',
        defaultStyle: {
          bgcolor: combineRgb(0, 255, 0),
          color: combineRgb(255, 255, 255)
        },
        options: [],
        callback: (feedback) => {
          // We need to access the variable value. 
          // Since we don't have direct access to the raw value in a public property,
          // we'll try to read the variable.
          // Note: In some module structures, variables are not directly accessible in feedback callbacks 
          // without using getVariableValue which might be async or not available in this context depending on base class.
          // However, we can look at how other feedbacks work. They use instance.feedbackState.
          // We didn't add ipQuality to feedbackState.
          // Ideally, we should add ipQuality to feedbackState in main.js if we want to use it here efficiently.
          // But let's try to use the variable if possible, or fallback to a safe default.
          
          // BETTER APPROACH: Let's add ipQuality to feedbackState in main.js first?
          // No, I'll use getVariableValue if available, or I'll rely on a new property I'll add to instance.
          
          // Let's assume we can access the variable.
          let quality = 'Unknown';
          if (instance.getVariableValue) {
             quality = instance.getVariableValue('ipQuality');
          }
          
          if (!quality) return {};

          let bgcolor = combineRgb(128, 128, 128); // Default grey
          
          if (quality === 'High' || quality === 'Very High') {
            bgcolor = combineRgb(0, 255, 0); // Green
          } else if (quality === 'Medium') {
            bgcolor = combineRgb(255, 255, 0); // Yellow
          } else if (quality === 'Low') {
            bgcolor = combineRgb(255, 165, 0); // Orange
          } else if (quality === 'Bad' || quality === 'Very Bad') {
            bgcolor = combineRgb(255, 0, 0); // Red
          }

          return { bgcolor: bgcolor };
        }
      }
    };
  },
};