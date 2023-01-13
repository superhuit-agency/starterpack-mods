module.exports = {
	singleQuote: true,
	tabWidth: 4,
	trailingComma: 'es5',
	useTabs: true,
	stylelintIntegration: true,
	overrides: [
		{
			files: ['*.yml', '*.yaml'],
			options: {
				tabWidth: 2,
			},
		},
	],
};
