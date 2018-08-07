module.exports = (api) => {
  api.cache(true)

  const envOpts = {
    modules: false,
    targets: {
      browsers: [ '> 1%', 'last 2 versions', 'not ie <= 8' ]
    }
  }

  const presets = [
    [ '@babel/preset-env', envOpts ]
  ]

  const plugins = [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-json-strings'
  ]

  // jest needs code to be transpiled to CJS
  if (process.env.NODE_ENV === 'test' || process.env.MODULE_TYPE === 'cjs') {
    envOpts.modules = 'commonjs'
  }

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
