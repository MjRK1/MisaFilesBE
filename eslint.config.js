import { Linter } from "eslint";
import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';

const config = {
  plugins: {},
  languageOptions: {
    parser: tsParser,
    globals: {
      page: true,
      browser: true,
      context: true,
    },

  },
  rules: {
    'max-len': ['error', { code: 180, comments: 512 }],
    'func-names': ['error', 'as-needed'],
    'semi': ['error', 'always'],
    'semi-spacing': ['error', { before: false, after: true }],
    'no-else-return': 'error',
    'no-prototype-builtins': 'error',
    'no-bitwise': 'error',
    'guard-for-in': 'error',
    'no-mixed-operators': 'error',
    'prefer-arrow-callback': 'error',
    'array-callback-return': 'error',
    'no-use-before-define': 'no',
    'one-var-declaration-per-line': 'error',
    'no-loop-func': 'error',
    'implicit-arrow-linebreak': ['error', 'beside'],
    'no-restricted-globals': ['error', 'event', 'fdescribe'],
    'no-confusing-arrow': 'error',
    'no-nested-ternary': 'error',
    'space-before-blocks': ['error', { functions: 'always', keywords: 'always', classes: 'always' }],
    'max-classes-per-file': 0,
    'class-methods-use-this': 0,
    'nonblock-statement-body-position': ['error', 'beside'],
    'brace-style': 'error',
    'array-bracket-spacing': ['error', 'never'],
    'prefer-destructuring': ['error', { object: true, array: false }],
    'no-multi-spaces': 'error',
    'block-spacing': 'error',
    'key-spacing': 'error',
    'comma-spacing': 'error',
    'padded-blocks': ['error', 'never'],
    'no-multiple-empty-lines': ['error', { max: 2, maxBOF: 0, maxEOF: 1 }],
    'lines-between-class-members': ['error', 'always'],
    'eol-last': ['error', 'always'],
    'no-trailing-spaces': ['error'],
    'space-before-function-paren': ['error', { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
    'no-lonely-if': 'error',
    'no-console': 'error',
    "quotes": 0,
    'quote-props': 0,
    ...tseslint.configs['recommended'].rules,
    ...tseslint.configs['eslint-recommended'],
  },
  ignores: ['eslint.config.js', 'vite.config.ts', '/dist/'],
  files: ['**/*.ts', '**/*.tsx'],

};

export default config;