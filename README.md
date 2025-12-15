# Indoor Navigation System

A mobile application designed to provide accurate indoor navigation and wayfinding capabilities using advanced positioning technologies. This system addresses the limitations of GPS in indoor environments by leveraging alternative sensing methods including accelerometer-based step tracking, WiFi fingerprinting, and Bluetooth beacons.

## 🎯 Features

- **Real-time Indoor Navigation**: Turn-by-turn navigation guidance for indoor spaces
- **Step-based Distance Tracking**: Accelerometer integration for accurate distance measurement
- **Voice Navigation**: Audio guidance for hands-free navigation
- **Multi-floor Support**: Navigate across different building floors with coordinate mapping
- **Visual Route Display**: Interactive map interface with icons and route visualization
- **User Movement Simulation**: Testing capabilities with simulated user journeys
- **Accessibility Focus**: Designed with considerations for visually impaired users
- **Path Correction**: Real-time route adjustments based on user position

## 🛠️ Tech Stack

- **Framework**: React Native / Expo 54
- **Language**: TypeScript
- **Package Manager**: Yarn
- **Sensors**: Device accelerometer for step detection
- **Navigation**: Custom pathfinding and route planning algorithms

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- Yarn package manager
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)
- A physical device for testing sensor features (recommended)

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/okorie2/Indoor-navigation-system.git
cd Indoor-navigation-system
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn start
```

4. Run on your preferred platform:
```bash
# For iOS
yarn ios

# For Android
yarn android
```

## 📱 Usage

### Basic Navigation

1. Launch the application
2. Enter your starting location
3. Enter your destination
4. Follow the turn-by-turn voice and visual guidance
5. The app will track your progress using step counting

### Voice Mode

Enable voice navigation for audio-based directions without looking at the screen - particularly useful for accessibility.

### Testing with Simulation

The app includes user movement simulation features for testing navigation logic without physical movement.

## 🏗️ Architecture

The application follows a modular architecture with key components:

- **Navigation Engine**: Core pathfinding and route calculation logic
- **Sensor Integration**: Accelerometer data processing for step detection
- **UI Components**: React Native components for map display and user interaction
- **Location Services**: Indoor positioning using various technologies
- **Voice Output**: Text-to-speech integration for audio guidance

## 🧪 Testing

Run the test suite:
```bash
yarn test
```

The project includes tests for:
- Navigation screen functionality
- Input screen validation
- Accelerometer hook behavior
- Route progress calculations

## 🗺️ Key Concepts

### Step-based Tracking
The system converts user movement into steps and calculates distance traveled, providing accurate position updates even without GPS.

### Angle Tolerance
Navigation instructions account for heading direction with configurable angle tolerance to improve accuracy of turn notifications.

### Floor Coordinates
Multi-floor navigation is supported through a coordinate system that maps positions across different building levels.

## 👥 Contributors

- [Ella (okorie2)](https://github.com/okorie2) - Project Lead
- [Owhondah Okechukwu Samuel (Psami-wondah)](https://github.com/Psami-wondah) - Path Correction & UI
- [boluwatifee4](https://github.com/boluwatifee4) - Code Refactoring
- [Johnnyevans32](https://github.com/Johnnyevans32) - Voice Navigation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development Roadmap

- [ ] Enhanced WiFi fingerprinting integration
- [ ] Bluetooth beacon support
- [ ] Improved accessibility features
- [ ] Cloud-based building database
- [ ] Real-time obstacle detection
- [ ] Multi-language support

## 📄 License

This project is currently under development. License information will be added soon.

## 🔗 Related Research

This project is informed by current research in indoor navigation systems, including:
- WiFi fingerprinting techniques
- Bluetooth beacon-based localization
- Deep learning approaches for positioning
- Accessibility-focused navigation systems
- Wayfinding and pathfinding algorithms

## 📧 Contact

For questions or feedback, please open an issue in this repository.

## 🙏 Acknowledgments

Special thanks to all contributors and the research community working on indoor navigation and positioning systems.

---

**Note**: This is an active research and development project. Features and documentation are continuously evolving.