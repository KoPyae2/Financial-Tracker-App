# Financial Tracker App

A comprehensive financial tracking application built with React Native and Expo. Track your income, expenses, and analyze your spending patterns with beautiful visualizations and a modern user interface.

## ✨ Key Features

- 💰 **Complete Transaction Management**
  - Add, edit, and delete transactions
  - Categorize with custom categories and icons
  - Add detailed notes to transactions
  - Support for multiple currencies
  - Quick actions for frequent operations

- 📊 **Advanced Analytics**
  - Visual breakdown of income vs expenses
  - Category-wise spending analysis
  - Monthly savings tracking
  - Custom date range filtering
  - Interactive charts and graphs

- 🎨 **Modern User Experience**
  - Clean and intuitive interface
  - Dark/Light theme support
  - Smooth animations
  - Haptic feedback
  - Privacy mode to hide sensitive data

- 🔒 **Security & Privacy**
  - Biometric authentication
  - Local data storage only
  - Privacy mode for sensitive information
  - Secure data export/import

## 🛠️ Tech Stack

- **Frontend Framework**: React Native + Expo
- **Styling**: TailwindCSS (NativeWind)
- **State Management**: Zustand
- **Type Safety**: TypeScript
- **UI Components**: 
  - React Native Reanimated
  - React Native SVG
  - Expo Vector Icons
- **Security**: Expo Local Authentication
- **Storage**: AsyncStorage

## 📱 Screenshots

[Add your app screenshots here]

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KoPyae2/Financial-Tracker-App.git
cd financial-tracker-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your preferred platform:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your physical device

## Project Structure

```
financial-tracker-app/
├── app/                    # Main application screens
│   ├── index.tsx          # Dashboard/Home screen
│   ├── transactions.tsx   # Transactions list and management
│   └── analytics.tsx      # Financial analytics and charts
├── components/            # Reusable components
├── store/                 # State management
├── types/                 # TypeScript type definitions
└── assets/               # Images, fonts, and other static files
```

## Features in Detail

### Transaction Management
- Add, edit, and delete transactions
- Categorize transactions with custom categories
- Add detailed notes to transactions
- Filter transactions by date range and categories

### Analytics
- Visual breakdown of income and expenses
- Category-wise spending analysis
- Monthly savings rate tracking
- Income vs Expense comparisons

### Categories
- Custom category creation
- Icon and color selection
- Category-based filtering and analysis

### Privacy Features
- Toggle visibility of sensitive financial data
- Secure local data storage
- No cloud sync (data stays on device)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Expo](https://expo.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [NativeWind](https://www.nativewind.dev/)
- [React Native](https://reactnative.dev/)
