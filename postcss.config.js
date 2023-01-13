
const isProd = process.env.NODE_ENV === 'production';

const plugins = {
	'postcss-easy-import': {extensions: ['scss', 'css']},
	'postcss-nested': {},
	'autoprefixer': {},
};

if ( isProd ) plugins.cssnano = { preset: 'default' };

module.exports = {
	plugins
};
