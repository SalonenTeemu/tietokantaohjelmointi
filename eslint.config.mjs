import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
	pluginJs.configs.recommended,
	eslintConfigPrettier,

	{
		files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
		ignores: ['node_modules/**', 'dist/**', '.env'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			sourceType: 'commonjs',
		},
		rules: {
			'prefer-const': 'warn',
			'no-constant-binary-expression': 'error',
			eqeqeq: 'error',
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'no-console': 'off',
		},
	},

	{
		files: ['**/*.mjs'],
		languageOptions: {
			sourceType: 'module',
		},
	},
];
