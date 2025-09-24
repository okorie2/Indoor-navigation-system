module.exports = {
  NativeModulesProxy: {},
  EventEmitter: jest.fn(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
  })),
};
