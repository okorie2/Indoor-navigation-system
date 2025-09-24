module.exports = {
  preset: "jest-expo",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|expo-modules-core|expo-location|expo-asset|expo-font|expo-constants)/)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^expo$": "<rootDir>/__mocks__/expo.js",
    "^expo-location$": "<rootDir>/__mocks__/expo-location.js",
    "^expo-modules-core$": "<rootDir>/__mocks__/expo-modules-core.js",
  },
};
