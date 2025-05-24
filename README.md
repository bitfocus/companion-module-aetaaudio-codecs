# companion-module-AETA-Audio-Codecs

A Bitfocus Companion module for controlling AETA Scoopy+ and compatible audio codecs via the AARC protocol.

## Features

- **Call Control:** Dial numbers or SIP URIs, hang up, and monitor call status (ringing, calling, established, released).
- **Audio Settings:** Set input gain, coding algorithm, and bit rate. Monitor real-time audio levels (VU meter).
- **Network Settings:** Change network type, IP quality, and packet replication.
- **System Settings:** Enable/disable 5A system, load preset configurations, refresh codec data.
- **Status Monitoring:** Automatic polling for codec status and alarms.
- **Feedbacks:** Button color changes for connection, call state, alarms, and VU meter levels.
- **Variables:** Exposes codec status, call state, audio/network/system parameters for use in Companion.

## Supported Devices

- **AETA Scoopy+**
- **AETA Scoop5S**
- **AETA ScoopFone HD**
- **AETA ScoopTeam**
- Any other AETA codec supporting the AARC protocol

## Getting Started

1. **Install the module** in Bitfocus Companion.
2. **Configure the module:**
   - **IP Address:** Enter the codec's IP.
   - **Port:** Default is 6000.
   - **Password:** (Optional) Enter if your codec requires it.
   - **Enable Status Polling:** Recommended for live status updates.
   - **Enable VU Meter:** For real-time audio level feedback.
3. **Add actions and feedbacks** to your Companion buttons as needed.

See [HELP.md](./companion/HELP.md) for full documentation on configuration, actions, feedbacks, and variables.

## What Works

- TCP connection and authentication to AETA codecs
- Full call control (dial, hang up, call state feedback)
- Audio and network parameter changes
- Real-time VU meter (input/output)
- Preset loading for common use cases
- Status polling and variable updates
- Feedbacks for connection, call state, alarms, and VU meter

## Work in Progress / To Do

- **Advanced alarm feedbacks:** More granular alarm monitoring and feedbacks.
- **Improved error handling:** More detailed error messages and recovery.
- **Additional actions:** Support for more codec features (e.g., ISDN backup, advanced routing).
- **Testing:** Broader testing on all supported AETA models.
- **Documentation:** Expand usage examples and troubleshooting.

## License

MIT License. See [LICENSE](./LICENSE).

## Contributing

Pull requests and bug reports are welcome!  
See [issues](https://github.com/bitfocus/companion-module-aeta-scoopy/issues) for open tasks.

---

*This module is not affiliated with AETA Audio Systems. For support with your codec hardware, contact AETA directly.*
