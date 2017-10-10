module.exports = {
  extends: ['last'],
  rules: {
    'no-console': 0,
  },
  globals: {
    console: true,
  },
  env: {
    browser: true,
    node: true,
    mocha: true,
  },
};
