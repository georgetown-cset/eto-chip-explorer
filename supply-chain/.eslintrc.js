module.exports = {
  "globals": {
    __PATH_PREFIX__: true,
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
    "sourceType": "module"
  },
  "rules": {
    "react-hooks/exhaustive-deps": "off"
  }
}
