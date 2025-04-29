import { Linter } from "eslint";
import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';

const config = {
  plugins: {
    tseslint: tseslint
  },
  languageOptions: {
    parser: tsParser,
    globals: {
      page: true,
      browser: true,
      context: true,
    },

  },
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  }
};

export default tseslint.config(
  tseslint.configs.recommended,
  config
);