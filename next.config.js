module.exports = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.wasm/,
            use: 'wasm-loader'
        });

        config.module.defaultRules = [
            {
              type: 'javascript/auto',
              resolve: {}
            },
            {
              test: /\.json$/i,
              type: 'json'
            }
        ];

        return {
            ...config,
            node: {
                fs: 'empty'
            }
        };
    }
};
