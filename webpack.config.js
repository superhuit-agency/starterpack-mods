const path = require('path');

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');

const camelCaseDash = (string) =>
	string.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
const wplib = [
	'a11y', 'api-fetch', 'blob', 'block-editor',
	'blocks', 'components', 'compose', 'data',
	'date', 'dom-ready', 'edit-post', 'editor',
	'element', 'hooks', 'html-entities', 'i18n',
	'keycodes', 'plugins', 'plugins', 'rich-text',
	'url', 'utils', 'viewport',
];

const DEV = process.env.NODE_ENV !== 'production';

module.exports = {
	stats: 'errors-only',
	mode: DEV ? 'development' : 'production',
	entry: {
		editor: './lib/_loader.ts',
	},
	resolve: {
		plugins: [
			new TsconfigPathsPlugin(), // add aliases from tsconfig.json
		],
		extensions: ['.tsx', '.ts', '.js', '.jsx', '.css'],
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: DEV ? '[name].js' : '[name].js', // TODO: add hash + manifest
	},
	externals: wplib.reduce(
		(externals, name) => ({ ...externals, [`@wordpress/${name}`]: `wp.${camelCaseDash(name)}` }),
		{
			wp: 'wp',
			react: 'React', // React itself is there in Gutenberg.
			'react-dom': 'ReactDOM',
		}
	),
	module: {
		rules: [
			{
				test: /\.(ts|tsx|js|jsx)$/,
				exclude: /node_modules\/(?!@superhuit)/,
				use: [
					{
						loader: require.resolve("babel-loader"),
						options: {
							presets: [
								'@babel/preset-env',
								require.resolve("@babel/preset-react"),
								require.resolve("@babel/preset-typescript")
							],
						}
					},
					require.resolve("react-docgen-typescript-loader")
				],
			},
			{
				test: /.css$/,
				use: [
					'style-loader',
					{ loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } },
					{ loader: 'postcss-loader' },
				]
			}
		]
	},
	plugins: [
		// prod only
		!DEV && new CleanWebpackPlugin(),

		// dev only
		DEV && new FriendlyErrorsPlugin({ clearConsole: true }),
	].filter(Boolean),
	optimization: {
		minimize: !DEV,
		minimizer: [
			new TerserPlugin({
				// TODO: find out why when activated, the js gets transpiled to es2015
				sourceMap: true,
				terserOptions: {
					compress: {
						warnings: false,
					},
					output: {
						comments: false,
					},
				},
			}),
		],
	},
	devServer: {
		contentBase: './dist',
		quiet: true,
		host: 'localhost',
		hot: true,
	},
}
