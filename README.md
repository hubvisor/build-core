# Hubvisor buildchain toolkit

Pins common build configuration and dependencies for hubvisor projects.

## Installation

`yarn add @hubvisor-build/core -D`

## Usage

- *Babel*: in your babel.config.js:
`module.exports = require('@hubvisor/build-core/babelrc.json')`

- *ESLint*: In your .eslintrc.js
`extends: '@hubvisor/hubvisor'`
