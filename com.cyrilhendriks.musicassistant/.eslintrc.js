module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'eslint-config-athom',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script', // CommonJS (require/exports)
  },
  rules: {
    strict: 'off',
  },
  ignorePatterns: ['node_modules/', '.homeybuild/', 'build/', 'dist/'],
};
