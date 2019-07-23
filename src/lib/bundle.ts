import glob from 'glob'
import path from 'path'
import { promisify } from 'util'
import { warn } from './log'

const aGlob = promisify(glob)

interface Bundle {
  name: string
  scripts: string[]
  pages: string[]
}

const sanitizeBundle = (bundle: Bundle): Bundle => {
  interface Filename {
    original: string
    name: string
    ext: string
  }

  const scriptsByName: { [name: string]: Filename | undefined } = {}
  bundle.scripts.forEach(filename => {
    const { ext, name } = path.parse(filename)

    // check that file name (without ext) is unique (case-insensitive; don't allow Index.js and index.ts)
    // and
    // prioritize extensions (ts > js)
    const canonicalName = name.toLowerCase()

    const existingScript = scriptsByName[canonicalName]
    if (existingScript) { // a script with same canonical name was already seen
      if (existingScript.ext !== ext) { // they have different extensions
        warn(`Found a js file with the same name as ts file in bundle '${bundle.name}'. js file will be ignored (${existingScript.original} / ${filename}).`)
        const shouldPreserveExistingTs = existingScript.ext === 'ts'
        if (shouldPreserveExistingTs) { return }
      } else { // same extension and filename ! probably a case issue
        warn(`Found duplicate filename in bundle '${bundle.name}', make sure to always use lowercase filenames.
        Preserved: ${existingScript.original} / Discarded: ${filename}`)
        return
      }
    }

    // use this file
    scriptsByName[canonicalName] = { original: filename, name, ext }
  })

  const scripts = Object.values(scriptsByName)
    .filter((filename): filename is Filename => !!filename)
    .map(filename => filename.original)

  return { ...bundle, scripts }
}

export const findBundleEntrypoints = async (bundlePath: string): Promise<Bundle> => {
  const name = path.basename(bundlePath)
  const options: glob.IOptions = { cwd: bundlePath, nodir: true }
  const [ scripts, pages ] = await Promise.all([ aGlob('*.{js,ts}', options), aGlob('*.html', options) ])
  return sanitizeBundle({ name, scripts, pages })
}

export const listBundles = async (searchPath: string): Promise<Bundle[]> => {
  const dirs = await aGlob('*/', { cwd: searchPath })
  return Promise.all(dirs.map(dir => findBundleEntrypoints(path.join(searchPath, dir))))
}
