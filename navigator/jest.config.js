module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|@react-navigation|expo(nent)?|@expo(nent)?|@unimodules|unimodules|sentry-expo|native-base)/)",
  ],
};
