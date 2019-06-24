import { Arguments } from 'yargs'
import { fail, stdout } from '../../../lib/log'

interface ResolveArgs {
  package: string
}

export const command = 'resolve <package>'
export const describe = 'Resolves a node package entrypoint from current directory'

export const handler = async (argv: Arguments<ResolveArgs>) => {
  try {
    const currentPath = process.cwd()
    stdout(require.resolve(argv.package, { paths: [ currentPath ] }))
  } catch (e) {
    fail(`Could not find a package named ${argv.package}`)
  }
}
