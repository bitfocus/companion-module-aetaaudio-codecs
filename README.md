# companion-module-AETA-Audio-Codecs

A Bitfocus Companion module for controlling AETA Scoopy+ and compatible audio codecs via the AARC protocol.

**Protocol from AETA is included for reference.**

## Features

- **Call Control:** Dial numbers or SIP URIs, hang up, and monitor call status (ringing, calling, established, released).
- **Audio Settings:** Set input gain, coding algorithm, and bit rate. Monitor real-time audio levels (VU meter).
- **Network Settings:** Change network type, IP quality, and packet replication.
- **System Settings:** Enable/disable 5A system, load preset configurations, refresh codec data.
- **Status Monitoring:** Automatic polling for codec status and alarms.
- **Feedbacks:** Button color changes for connection, call state, alarms, and VU meter levels.
- **Variables:** Exposes codec status, call state, audio/network/system parameters for use in Companion.

## Supported Devices

- HIFISCOOP 3 5AS
- SCOOP 3 5AS
- SCOOP 4+
- SCOOPY+
- SCOOP 5 and SCOOP 5 IP
- Scoop5 S, Scoop5 S-IP and Scoopy+ S


## What Works

- TCP connection and authentication to AETA codecs
- Full call control (dial, hang up, call state feedback)
- Audio and network parameter changes
- Status polling and variable updates
- Feedbacks for connection, call state, alarms.

## Work in Progress / To Do

- **VU meter** Codecs send audio levels over UDP. But we need a way to receive those in companion without overflooding the connection.
- **Advanced alarm feedbacks:** More granular alarm monitoring and feedbacks.
- **Additional actions:** Support for more codec features (e.g., ISDN backup, advanced routing).
- **Testing:** Broader testing on all supported AETA models.
- **Documentation:** Expand usage examples and troubleshooting.

*This module is not affiliated with AETA Audio Systems. For support with your codec hardware, contact AETA directly.*
