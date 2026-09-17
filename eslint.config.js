import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // `.stale-*` is what the Storybook build leaves behind when the safe-delete
  // guard refuses to remove the previous output: ignored by git, but still a
  // directory full of generated `.d.ts` files ESLint would otherwise read.
  { ignores: ['dist', 'storybook-static', '.stale-*', 'coverage', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // This package is a component library, not an app: co-exporting variant
      // helpers (`buttonVariants`, `badgeVariants`, …) next to their component
      // is the intended shadcn-style API, so the Fast Refresh rule is noise.
      'react-refresh/only-export-components': 'off',
    },
  }
)
