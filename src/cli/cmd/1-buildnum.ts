import { currentBuildNumber, bumpBuildNumber } from '../../lib/build-number'
import { currentPackage } from '../../lib/package'
import { Arguments, CommandBuilder } from 'yargs'
import { stdout } from '../../lib/log'

interface BuildNumArgs {
  path: string | undefined
}

export const command = 'buildnum [path]'
export const describe = 'Obtains or bumps a package build number'
export const builder: CommandBuilder = {
  bump: {
    type: 'boolean',
    default: false,
    describe: 'Increments build number before returning it'
  },
  full: {
    type: 'boolean',
    default: false,
    describe: 'Prints full package name and build number'
  }
}

export const handler = async (argv: Arguments<BuildNumArgs>) => {
  const { path, full } = argv
  const pkg = await currentPackage({ fromPath: path })
  if (typeof pkg.name !== 'string') { throw new Error(`package.json is malformed (could not find 'package.name')`) }
  const asyncVersion = argv.bump ? bumpBuildNumber({ package: pkg.name }) : currentBuildNumber({ package: pkg.name })
  const version = await asyncVersion
  stdout(full ? `${pkg.name}:${version}` : `${version}`)
}
