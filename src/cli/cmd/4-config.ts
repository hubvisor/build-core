import { Arguments } from 'yargs'
import { currentConfiguration } from '../../config'
import { stdout } from '../../lib/log'

export const command = 'config'
export const describe = 'Prints hb configuration in json format'

export const handler = async (argv: Arguments) => {
  stdout(await currentConfiguration)
}
