module.exports = {
  preset: "jest-expo",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(expo|expo-modules-core|expo-location|expo-asset|expo-font|expo-constants|@expo|react-native|@react-native|@react-navigation|lucide-react-native)/)"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^expo$": "<rootDir>/__mocks__/expo.js",
    "^expo-modules-core$": "<rootDir>/__mocks__/expo-modules-core.js",
    "^expo-location$": "<rootDir>/__mocks__/expo-location.js",
  },
};
