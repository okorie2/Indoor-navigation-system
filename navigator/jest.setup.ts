import "@testing-library/jest-native/extend-expect";

// 👇 mock expo-location globally so native code never runs
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  watchHeadingAsync: jest.fn(),
}));

// Optional: silence noisy console.error logs during test
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
