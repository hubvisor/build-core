import { readdir, lstat, existsSync, mkdir, readFile, writeFile } from 'fs'
import { promisify } from 'util'
import { resolve, isAbsolute } from 'path'
import Handlebars from 'handlebars'
import { log } from './log'
import chalk from 'chalk'

const asyncMkdir = promisify(mkdir)
const asyncReaddir = promisify(readdir)
const asyncReadFile = promisify(readFile)
const asyncWriteFile = promisify(writeFile)
const asyncLstat = promisify(lstat)

export interface InstantiateTemplateOptions {
  sourcePath: string // template source file or directory
  destinationPath: string
  context: object
  dryRun?: boolean
}

const templateString = (content: string, context: object): string => {
  return Handlebars.compile(content)(context)
}

const instantiateFile = async (src: string, dst: string, options: InstantiateTemplateOptions) => {
  log(`📄 ${src}\n   ↳ ${dst}`)
  if (!options.dryRun) {
    const content = await asyncReadFile(src, 'utf8')
    const replacedContent = templateString(content, options.context)
    await asyncWriteFile(dst, replacedContent, 'utf8')
  }
  log(chalk`   {green ✔} Done !`)
}

const instantiateDirectory = async (src: string, dst: string, options: InstantiateTemplateOptions) => {
  log(`📂 ${src}\n   ↳ ${dst}`)
  if (!options.dryRun) {
    await asyncMkdir(dst)
  }
  log(chalk`   {green ✔} Done !`)
}

const instantiateTemplateContent = async (src: string, dst: string, options: InstantiateTemplateOptions) => {
  if (!isAbsolute(src)) { throw new Error('Template source path must be absolute !') }
  if (!isAbsolute(dst)) { throw new Error('Template destination path must be absolute !') }

  if (!existsSync(src)) { throw new Error(`Template content not found: '${src}'`) }
  if (existsSync(dst)) { throw new Error(`Output file already exists: '${dst}'`) }

  const srcStat = await asyncLstat(src)
  if (srcStat.isFile()) {
    await instantiateFile(src, dst, options)
  } else if (srcStat.isDirectory()) {
    await instantiateDirectory(src, dst, options)
    const files = await asyncReaddir(src)
    for (const file of files) {
      const from = resolve(src, file)
      const to = resolve(dst, templateString(file, options.context)) // also apply template to filenames
      await instantiateTemplateContent(from, to, options)
    }
  } else {
    throw new Error(`Unhandled template file type: '${src}'`)
  }
}

export const instantiateTemplate = async (options: InstantiateTemplateOptions) => {
  return instantiateTemplateContent(options.sourcePath, options.destinationPath, options)
}
