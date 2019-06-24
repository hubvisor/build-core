import { Arguments, CommandBuilder } from 'yargs'
import chalk from 'chalk'
import execa from 'execa'
import { resolvedConfiguration } from '../../config'
import { fail, log, stdout } from '../../lib/log'

const shellInterpolateEnv = (str: string): string => {
  return Object.entries(process.env)
    .sort(( [ name1 ], [ name2 ] ) => name2.length - name1.length) // sort longer env names to be matched first to replace in a greedy way
    .reduce((prev, [ name, value ]) => {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape env name to make it regexp compatible

      return prev.replace(new RegExp(`\\$${escapedName}`, 'g'), value || '') // replace $NAME by value
  }, str)
}

const runCommandIfNeeded = async () => {
  const [ cmd, ...args ] = process.argv.slice(3)
  if (cmd) {
    const argsFmt = args
      .map(shellInterpolateEnv) // simulate shell variable interpolation
      .map(a => a.includes(' ') ? `"${a}"` : a)  // if the arg contains space, quote it
      .join(' ')
    log(chalk`{gray $ ${cmd} ${argsFmt}}`)
    try {
      await execa(cmd, args, { stdio: 'inherit', shell: true })
    } catch (err) {
      fail(`Error while executing command '${cmd} ${argsFmt}':`, err)
      process.exitCode = err.exitCode
    }
  }
}

interface EnvArgs {
  cmd?: string[]
  export?: boolean
}

export const command = 'env [cmd..]'
export const describe = 'Detect variables and optionally runs a shell command with this env'
export const builder: CommandBuilder = {
  'export': {
    boolean: true,
    default: false
  }
}

export const handler = async (argv: Arguments<EnvArgs>) => {
  if (!argv.export) {
    log(chalk`{bold.cyan ❯} detecting env...`)
  }

  const config = await resolvedConfiguration
  Object.assign(process.env, config.detected)

  if (argv.export) {
    Object.entries(config.detected).forEach(([ name, value]) => {
      stdout(`export ${name}=${value}`)
    })
  } else {
    Object.entries(config.detected).forEach(([ name, val ]) => {
      if (val) { log(chalk`{green ✔} ${name} = ${val}`) }
    })
    await runCommandIfNeeded()
  }
}
