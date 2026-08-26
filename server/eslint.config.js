// Config ESLint du backend. Signale les imports et variables inutilises.
import globals from 'globals';

export default [
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': 'warn',
    },
  },
];
