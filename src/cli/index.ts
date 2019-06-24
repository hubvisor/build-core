import yargs from 'yargs'
import { currentConfiguration } from '../config'
import { fail } from '../lib/log'

const runYargs = async () => {
  const config = await currentConfiguration

  config.commands.reduce((y, cmd) => y.commandDir(cmd.path), yargs) // eslint-disable-line no-unused-expressions
    .commandDir('cmd')
    .demandCommand()
    .help()
    .version(false)
    .argv
}

export default () => {
  runYargs()
    .catch(err => {
      fail(`A fatal error happened: ${err.message}\n${err.stack}`)
      process.exitCode = 1
    })
}
