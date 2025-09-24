export const requestForegroundPermissionsAsync = jest.fn(async () => ({
  status: "granted",
}));

export const watchHeadingAsync = jest.fn((_options, callback) => {
  // simulate heading updates
  const subscription = { remove: jest.fn() };
  callback({ trueHeading: 90, magHeading: 85 });
  return Promise.resolve(subscription);
});

export const LocationAccuracy = {
  Balanced: 3,
};
