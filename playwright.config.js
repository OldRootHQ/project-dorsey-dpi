// OldRoot's existing website regression tests exercise the site *after* entrance.
// The welcome-specific suite separately verifies genuine first-visitor behavior.
// No production code is suppressed or altered for automation.
module.exports = {
  use: {
    storageState: {
      cookies: [],
      origins: [{
        origin: 'http://127.0.0.1:8000',
        localStorage: [{ name: 'oldroot-welcome-seen-v1', value: 'yes' }]
      }]
    }
  }
};
