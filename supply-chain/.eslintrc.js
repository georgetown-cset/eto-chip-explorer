module.exports = {
  "globals": {
    __PATH_PREFIX__: true,
    "fetchMock": true,
  },
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "react-app",
    "eslint:recommended",
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
  },
  "root": true
}
