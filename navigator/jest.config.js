module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!(expo|expo-modules-core|expo-location|expo-asset|expo-font|expo-constants|@expo|react-native|@react-native|@react-navigation|lucide-react-native)/)",
  ],
  // setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^expo$": "<rootDir>/__mocks__/expo.js",
    "^expo-modules-core$": "<rootDir>/__mocks__/expo-modules-core.js",
    "^expo-location$": "<rootDir>/__mocks__/expo-location.js",
  },
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/*.styles.ts',
  ],
};