const { expo } = require('./app.json');

module.exports = () => {
  const profile = process.env.EAS_BUILD_PROFILE;
  const apnsEnvironment = process.env.EXPO_APNS_ENV
    || (profile && profile !== 'development' ? 'production' : 'development');
  if (!['development', 'production'].includes(apnsEnvironment)) {
    throw new Error('EXPO_APNS_ENV must be development or production');
  }
  return {
    ...expo,
    ios: {
      ...expo.ios,
      entitlements: { ...expo.ios.entitlements, 'aps-environment': apnsEnvironment },
    },
  };
};
