import { findUp } from './find-up'

interface CurrentPackageOptions {
  fromPath?: string
}

export const currentPackagePath = async ({ fromPath }: CurrentPackageOptions = {}): Promise<string> => {
  const path = await findUp({ fromPath, filename: 'package.json' })
  if (!path) {
    throw new Error(`Could not find 'package.json' from path '${path}'`)
  }
  return path
}

export const currentPackage = async (options: CurrentPackageOptions = {}): Promise<{ [field: string]: unknown }> => {
  const path = await currentPackagePath(options)
  try {
    return require(path)
  } catch (err) {
    throw new Error(`Could not parse ${path} : ${err.message}`)
  }
}
