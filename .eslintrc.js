/* eslint @typescript-eslint/no-var-requires: "off" */
const path = require('path');

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    allowImportExportEverywhere: false,
    codeFrame: false,
    ecmaFeatures: {
      jsx: true
    },
    babelOptions: {configFile: path.resolve(__dirname, '.babelrc')}
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['@babel', '@typescript-eslint', 'prettier'],
  rules: {
    'no-console': 'warn',
    'prettier/prettier': 'error',
    'linebreak-style': ['off', 'unix'],
    quotes: ['error', 'single', {avoidEscape: true}],
    semi: ['error', 'always'],

    'comma-dangle': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',

    '@babel/new-cap': 'error',
    '@babel/no-invalid-this': 'error',
    '@babel/no-unused-expressions': 'error',
    '@babel/object-curly-spacing': 'error',
    '@babel/semi': 'error'
  }
};
