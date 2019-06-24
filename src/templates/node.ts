import { Template } from '../config'
import { ask } from '../lib/cli'
import { resolve } from 'path'
import { instantiateTemplate } from '../lib/templates'
import { currentPackage } from '../lib/package'

const sourcePath = resolve(__dirname, '../../templates/node')

const node: Template = {
  name: 'node',
  description: 'A simple node.js application or library using typescript',
  generate: async ({ dryRun }) => {
    const packageId = await ask<string>({
      type: 'input',
      message: 'What is your project package name ?',
      default: 'new-project',
      validate: input => input.length >= 3
    })

    const buildCorePkg = await currentPackage({ fromPath: __dirname })

    await instantiateTemplate({
      sourcePath,
      destinationPath: resolve(packageId),
      context: {
        packageId,
        tslibVersion: (buildCorePkg.dependencies as any)['tslib'],
        buildCoreVersion: `^${buildCorePkg.version}`
      },
      dryRun
    })
  }
}

export default node
