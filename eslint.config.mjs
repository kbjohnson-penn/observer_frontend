import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      // Enforce functional programming patterns
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // React/Hooks best practices
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-no-target-blank': 'error',
      'react/no-array-index-key': 'warn',

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',

      // Code quality
      'no-debugger': 'warn',
      'no-alert': 'warn',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['**/logger.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  // Override default ignores of eslint-config-next
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'node_modules/**']),
]);

export default eslintConfig;
