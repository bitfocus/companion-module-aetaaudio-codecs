# AETA Scoopy+ Module for Companion

This module allows control of AETA Scoopy+ audio codecs through Companion.

## Configuration

* **IP Address** - The IP address of your AETA codec
* **Port** - The TCP port for AARC protocol (default: 6000)
* **Password** - AARC password if configured on the codec (leave blank if none)
* **Enable Status Polling** - Enable/disable automatic status updates
* **Polling Interval** - How often to poll for status updates (in milliseconds)
* **Enable VU Meter** - Enable real-time audio level monitoring
* **VU Meter Interval** - How often to update VU meters (in milliseconds)

## Available Actions

### Call Control
* **Dial Number** - Make a call to a specified number or SIP URI
* **Hang Up** - End the current call

### Audio Settings
* **Set Input Gain** - Adjust input gain (-12 to +12 dB)
* **Monitor Audio Levels** - Start/stop VU meter monitoring
* **Set Coding Algorithm** - Change the audio coding algorithm
* **Set Coding Bit Rate** - Change the audio bit rate

### Network Settings
* **Set Network Type** - Change network interface type
* **Set IP Quality** - Adjust IP streaming quality settings
* **Set Packet Replication** - Configure packet redundancy

### System Settings
* **Set 5A System** - Enable/disable 5A system
* **Load Preset Configuration** - Apply predefined settings:
  - High Quality (Opus Stereo)
  - Low Latency (G722)
  - Mobile Data (Low Bandwidth)
  - ISDN Backup Mode
* **Refresh Data** - Manual refresh of codec status

## Available Feedbacks

### Status Indicators
* **Codec Connected** - Changes color when codec has an established connection
* **Ringing** - Changes color when there's an incoming call
* **Calling** - Changes color during outgoing call attempt
* **Call Established** - Changes color when call is connected
* **Call Released** - Changes color when call is ended

### Technical Monitoring
* **Codec Alarms** - Changes color when the codec has active alarms
* **VU Meter** - Shows real-time audio levels with color gradients
  - Green: Normal levels (-40dB and below)
  - Yellow: Moderate levels (-40dB to -20dB)
  - Orange: High levels (-20dB to -10dB)
  - Red: Very high levels (-10dB and above)

## Variables

### Connection Status
* Connection Status
* Codec Model
* Last Error Message

### Call Status
* Ringing Status
* Calling Status
* Established Status
* Released Status
* Dial Number
* Local Number

### Audio Settings
* Coding Algorithm
* Coding Bit Rate
* Audio Status
* Audio Level
* Input/Output Gain

### Network Settings
* Network Type
* IP Quality
* Packet Replication
* Network Quality
* Jitter Buffer Status

### System Status
* Active Alarms
* 5A System Status
* Configuration Number
* Test Loop Status

### Network Configuration
* IP Address
* IP Mask
* Gateway
* DNS
* DHCP Mode

## Supported Models

* AETA Scoopy+
* Other AETA codecs supporting AARC protocol

## Error Handling

The module includes comprehensive error handling:
* Connection failures
* Authentication errors
* Invalid commands
* Network issues
* Audio problems
* Hardware alarms

## Version History

### Version 1.0.0
* Initial release
* Basic call control
* Codec configuration
* Status monitoring

### Version 1.1.0
* Added VU meter support
* Added preset configurations
* Enhanced alarm monitoring
* Improved error handling
