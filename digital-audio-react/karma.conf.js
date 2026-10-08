// =====================================================================
// CONFIGURACIÓN DE KARMA + JASMINE PARA REACT
// - Jasmine: framework de pruebas (describe / it / expect / spyOn).
// - Karma: ejecuta las pruebas en un navegador real (Chrome Headless).
// - karma-webpack + babel-loader: compilan JSX/ES6 antes de ejecutar.
// - babel-plugin-istanbul + karma-coverage: generan el informe de cobertura
//   en coverage/html/index.html (líneas, sentencias, ramas y funciones).
// Ejecutar: npm test
// =====================================================================
module.exports = function (config) {
    config.set({
        frameworks: ['jasmine', 'webpack'],

        files: [{ pattern: 'test/**/*.spec.js', watched: false }],

        preprocessors: { 'test/**/*.spec.js': ['webpack'] },

        webpack: {
            mode: 'development',
            devtool: 'inline-source-map',
            module: {
                rules: [
                    {
                        test: /\.jsx?$/,
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                babelrc: false,
                                configFile: false,
                                presets: [
                                    ['@babel/preset-env', { targets: { chrome: '100' } }],
                                    ['@babel/preset-react', { runtime: 'automatic' }]
                                ],
                                // Instrumenta solo el código de la app (src) para medir cobertura
                                plugins: [['istanbul', { include: ['src/**'], exclude: ['test/**', 'src/index.js'] }]]
                            }
                        }
                    },
                    { test: /\.(png|jpe?g|gif|svg)$/i, type: 'asset/resource' },
                    { test: /\.css$/i, type: 'asset/resource' }
                ]
            },
            resolve: { extensions: ['.js', '.jsx'] }
        },

        reporters: ['progress', 'kjhtml', 'coverage'],

        coverageReporter: {
            dir: 'coverage/',
            reporters: [
                { type: 'html', subdir: 'html' },
                { type: 'text-summary' },
                { type: 'json-summary', subdir: '.', file: 'coverage-summary.json' }
            ]
        },

        client: {
            clearContext: false,           // deja visible el reporte de Jasmine en el navegador
            jasmine: { random: false }
        },

        browsers: ['ChromeHeadless'],
        customLaunchers: {
            ChromeHeadlessSinSandbox: { base: 'ChromeHeadless', flags: ['--no-sandbox'] }
        },
        singleRun: true
    });
};
