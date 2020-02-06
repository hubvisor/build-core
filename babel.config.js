module.exports = (api) => {
  api.cache(true)

  // jest needs code to be transpiled to CJS
  const useCommonJs = process.env.NODE_ENV === 'test' || process.env.MODULE_TYPE === 'cjs'

  const presets = [
    [ '@babel/preset-env', {
      modules: useCommonJs ? 'commonjs' : false,
      // useBuiltIns: 'usage', // includes polyfills based on usage
      targets: {
        browsers: [ '> 1%', 'last 2 versions', 'not ie <= 8' ]
      }
    } ]
  ]

  const plugins = [
    [ '@babel/plugin-transform-runtime', {
      corejs: 2, // injects non-polluting polyfills
      useESModules: !useCommonJs
    } ],
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-json-strings'
  ]

  return {
    presets,
    plugins,
    env: {
      production: {
        ignore: [
          '**/__tests__/**/*.js',
          '**/*.test.js',
          '**/*.spec.js'
        ]
      }
    }
  }
}
