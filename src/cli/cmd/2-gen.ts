import { Arguments, CommandBuilder } from 'yargs'

import { autocomplete, ask } from '../../lib/cli'
import { resolvedConfiguration, Template } from '../../config'
import { log, success, fail } from '../../lib/log'

interface GenArgs {
  dryRun?: boolean
}

export const command = 'gen'
export const desc = 'Generates code using a template'
export const builder: CommandBuilder = {
  dryRun: {
    type: 'boolean',
    default: false,
    describe: 'Do not perform actions but output result only'
  }
}

export const handler = async (args: Arguments<GenArgs>) => {
  const { dryRun } = args
  const config = await resolvedConfiguration
  const template = await ask<Template>(autocomplete({
    message: 'Which template do you want to use ?',
    name: 'template',
    choices: config.templates.map(t => ({
      name: `${t.name} - ${t.description}`,
      value: t
    }))
  }))

  log(`📦 Instantiating template '${template.name}'...`)
  try {
    await template.generate({ dryRun })
    success(`Success !`)
  } catch (err) {
    fail(`Failed to instantiate template ! ${err.message}\n${err.stack}`)
    process.exitCode = 1
  }
}
