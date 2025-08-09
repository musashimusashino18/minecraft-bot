const globals = require('globals');
const js = require('@eslint/js');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest, // Add Jest globals
      },
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
    },
    rules: {
      // Custom rules or overrides
    },
  },
  js.configs.recommended, // Equivalent to "eslint:recommended"
  {
    // Configuration for prettier plugin
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules, // Apply rules from eslint-config-prettier
      'prettier/prettier': 'error', // Your specific rule
    },
  },
  {
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];
