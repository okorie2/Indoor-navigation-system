import "@testing-library/jest-native/extend-expect";

// 🔹 Mock Expo modules that cause "winter runtime" crash
jest.mock("expo", () => ({}));
jest.mock("expo-modules-core", () => ({}));
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  watchHeadingAsync: jest.fn(),
}));

// Optional: silence console warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning:") || args[0].includes("deprecated"))
    ) {
      return;
    }
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
