import { resolve, parse, dirname } from 'path'
import { existsSync, lstat } from 'fs'
import { promisify } from 'util'

interface FindUpOptions {
  filename: string
  fromPath?: string
}

const asyncLstat = promisify(lstat)

const isFile = async (filename: string) => {
  const res = await asyncLstat(filename)
  return res.isFile()
}

export const findUp = async ({ filename, fromPath }: FindUpOptions): Promise<string | undefined> => {
  const basePath = resolve(fromPath || '')
  let currentPath = basePath
  const { root } = parse(currentPath)
  while (currentPath !== root) {
    const filePath = resolve(currentPath, filename)
    if (existsSync(filePath) && await isFile(filePath)) { return filePath }
    currentPath = dirname(currentPath)
  }
}
