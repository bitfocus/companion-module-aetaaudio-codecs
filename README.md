# AETA Audio Codecs Companion Module

This module allows you to control AETA Audio Codecs Bitfocus Companion.
Files in "Utilities" folder are for dev purpore.
The dialPad-page.companionconfig is a template that can be used for call numbers input.

## Features

- Full call control (dial, hang up, redial, etc.)
- Audio configuration (input/output gain, coding algorithm, bit rate, interface format, etc.)
- Network configuration (type, IP quality, packet replication, DHCP/static, IP, DNS, gateway, mask)
- System and advanced settings (5A system, presets, reset, custom AT# commands, ISDN/POTS, backup, loop, relay, GPI/GPO, etc.)
- Feedbacks for connection, call, and alarm status
- Variable support for dynamic actions
- Comprehensive error handling

## Configuration

- **IP Address**: IP of your AETA codec
- **Port**: TCP port for AARC protocol (default: 6000)
- **Password**: AARC password if set (leave blank if none)
- **Enable Status Polling**: Enable/disable automatic status updates
- **Polling Interval**: How often to poll for status updates (ms)
- **Enable VU Meter**: (Feature currently disabled)
- **VU Meter Interval**: (Feature currently disabled)

## Actions

### Call Control
- Dial Number (manual entry or variable)  
  _Applicable units: all units_
- Hang Up  
  _Applicable units: all units_

### Audio Settings
- Set Input Gain  
  _Applicable units: HS3, S3, S4, S5, S+, SxS_
- Set Output Gain  
  _Applicable units: all units_
- Set Coding Algorithm  
  _Applicable units: all units_
- Set Coding Bit Rate  
  _Applicable units: all units_
- Set Audio Interface Format  
  _Applicable units: HS3, S3, S4, S5, Scoop5 S, Scoop5 S-IP_
- Set AES Sync Mode  
  _Applicable units: S4, S5, Scoop5 S, Scoop5 S-IP_
- Set AES Nominal Sampling Rate  
  _Applicable units: S4, S5, Scoop5 S, Scoop5 S-IP_
- Set Input Impedance  
  _Applicable units: S4, S5, Scoop5 S_
- Set Output Load  
  _Applicable units: HS3, S3_
- Set Channel Panning Mode  
  _Applicable units: S+, Sy+ S_
- Set Output Signal Selection  
  _Applicable units: S+, Sy+ S_
- Set Input Attenuation Pad  
  _Applicable units: S+, Sy+ S_
- Set Headphone Coordination Channel Routing  
  _Applicable units: S+, Sy+ S_
- Monitor Audio Levels (feature currently disabled)

### Network Settings
- Set Network Type  
  _Applicable units: all units_
- Set IP Quality  
  _Applicable units: S4, S5, S+, SxS_
- Set Packet Replication  
  _Applicable units: S+, S5, SxS_
- Set DHCP Mode  
  _Applicable units: S4, S5, S+, SxS_
- Set IP Address  
  _Applicable units: S4, S5, S+, SxS_
- Set DNS Address  
  _Applicable units: S4, S5, S+, SxS_
- Set Gateway  
  _Applicable units: S4, S5, S+, SxS_
- Set Subnet Mask  
  _Applicable units: S4, S5, S+, SxS_

### System Settings
- Set 5A System  
  _Applicable units: all units_
- Load Preset Configuration (High Quality, Low Latency, Mobile Data, ISDN Backup)  
  _Applicable units: all units (presets use multiple commands)_
- Refresh Data
- Reset Device  
  _Applicable units: all units_
- Send Custom AT# Command  
  _Applicable units: all units_

### Advanced/Other
- Set Dial Method  
  _Applicable units: S+, S4, S5, SxS_
- Set Dial Tone  
  _Applicable units: S+, S4, S5, SxS_
- Set ISDN Call Filter  
  _Applicable units: all units_
- Set Proprietary ISDN Filter  
  _Applicable units: HS3, S3_
- Set High Layer Capability (HLC)  
  _Applicable units: HS3, S3_
- Set Auto Redial  
  _Applicable units: S4, S5, S+, SxS_
- Set Redial Retries  
  _Applicable units: S4, S5, S+, SxS_
- Set Redial Wait Time  
  _Applicable units: S4, S5, S+, SxS_
- Set Loop Control  
  _Applicable units: S4, S5, Scoop5 S, Scoop5 S-IP_
- Set Backup Network  
  _Applicable units: S4, S5, SxS_
- Set Passive Backup Mode  
  _Applicable units: S4, S5, SxS_
- Set Original/Copy Field (MPEG only)  
  _Applicable units: HS3, S3_
- Set Copyright Field (MPEG only)  
  _Applicable units: HS3, S3_
- Set Error Correction/Protected Mode  
  _Applicable units: all units_
- Set Clock Mode (POTS)  
  _Applicable units: S+, S5, SxS_
- Set Line Level (POTS)  
  _Applicable units: S+, S5, SxS_
- Set Speed (POTS)  
  _Applicable units: S+, S4, S5, SxS_
- Set Data Channel  
  _Applicable units: all units_
- Set Data Channel Baud Rate  
  _Applicable units: all units_
- Set Relay Transmission  
  _Applicable units: all units_
- Set GPI State  
  _Applicable units: S+, S4, S5, SxS_
- Set GPO State  
  _Applicable units: S+, S4, S5, SxS_
- Set Auxiliary 3 kHz Audio Channel  
  _Applicable units: HS3, S3, S4, S5_
- Display Text Message  
  _Applicable units: S+, S4, S5, SxS_

## Feedbacks

- Codec Connected
- Ringing
- Calling
- Call Established
- Call Released
- Codec Alarms

## Variables

- Connection Status, Codec Model, Last Error Message
- Ringing/Calling/Established/Released Status
- Dial Number, Local Number
- Coding Algorithm, Bit Rate, Audio Status, Audio Level, Input/Output Gain
- Network Type, IP Quality, Packet Replication, Network Quality, Jitter Buffer Status
- Active Alarms, 5A System Status, Configuration Number, Test Loop Status
- IP Address, IP Mask, Gateway, DNS, DHCP Mode

## Supported Models

- HIFISCOOP 3
- SCOOP 3
- SCOOP 4+
- SCOOPY+
- Scoop5 S
- Scoop5 S-IP
- Scoopy+ S

## Error Handling

Handles:
- Connection failures
- Authentication errors
- Invalid commands
- Network issues
- Audio problems
- Hardware alarms

## Version History

### 1.0.0
- Initial release
