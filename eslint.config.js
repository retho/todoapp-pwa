import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

const commonRules = {
  "@typescript-eslint/no-unused-vars": ['warn'],
  "no-console": ['warn'],
  // "@typescript-eslint/no-misused-promises": ['warn'],
}

const disabledRules = {
  "@typescript-eslint/no-unnecessary-type-constraint": ['off'],
}


export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...commonRules,
      ...disabledRules,
    }
  },
])
