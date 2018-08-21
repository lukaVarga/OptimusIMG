const path = require('path');

module.exports = {
	entry: './src/runtime/index.ts',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: [{
					loader: 'ts-loader',
					options: {
						configFile : 'tsconfig.dist.json'
					}
				}],
				include: [
					path.resolve(__dirname, 'src', 'runtime')
				],
				exclude: [
					/node_modules/,
					path.resolve(__dirname, 'src', 'buildtime'),
					path.resolve(__dirname, '__tests__')
				]
			}
		]
	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.js' ]
	},
	output: {
		filename: 'OptimusIMG-bundle.min.js',
		path: path.resolve(__dirname, 'dist'),
		library: 'OptimusIMG'
	}
};