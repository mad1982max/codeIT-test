module.exports = {
    entry: './src/js/main.js',
    output: {
        filename: 'bundle.js'
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: [
                        ['latest', { modules: false }],
                    ],
                },
            },
        ],
    },
};