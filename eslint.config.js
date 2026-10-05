import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strict],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
      // Security: no dynamic code execution or raw HTML injection.
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'dangerouslySetInnerHTML is banned. Render user text through React escaping.',
        },
        {
          selector: "MemberExpression[property.name=/^(innerHTML|outerHTML)$/]",
          message: 'Direct HTML injection is banned.',
        },
        {
          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
          message: 'Direct HTML injection is banned.',
        },
      ],
    },
  },
  {
    // Context modules export a provider plus its hook; fast refresh just reloads them.
    files: ['src/**/*Context.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // UI must not reach around the repository layer.
    files: ['src/features/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/mock/**', '**/mock'], message: 'UI must get data via repositories (src/data hooks).' },
            { group: ['**/data/memory/**'], message: 'UI must not depend on a repository implementation.' },
          ],
        },
      ],
    },
  },
  {
    // Domain logic stays pure.
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['react', 'react-*', 'react/*'], message: 'Domain code must not depend on React.' },
            { group: ['**/data/**', '**/mock/**', '**/features/**'], message: 'Domain code must not do I/O.' },
          ],
        },
      ],
    },
  },
);
