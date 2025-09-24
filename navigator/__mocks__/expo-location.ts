module.exports = {
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  watchHeadingAsync: jest.fn(() => ({ remove: jest.fn() })),
};
