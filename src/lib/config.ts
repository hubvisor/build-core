import { isAbsolute, resolve } from 'path'
import _ from 'lodash'
import { findUp } from './find-up'
import { existsSync } from 'fs'
import { debug, fail } from './log'

export const configuration = async <T> (path: string): Promise<T | undefined> => {
  if (!isAbsolute(path)) { throw new Error('Configuration must be loaded from an absolute path !') }

  try {
    if (existsSync(path)) {
      debug(`Loading configuration from '${path}'...`)
      const config = require(path)
      debug(`  ↳ Loaded configuration`, config)
      return config
    }
  } catch (err) {
    fail(`Error while loading configuration: ${err.message}\n${err.stack}`)
  }
}

const findLocations = async (appName: string): Promise<string[]> => { // returned locations are from less specific to more specific
  // TODO: we may need to store a set of visited path and allow extends package configs like eslint
  // instead of a preset of known paths
  const locations: string[] = []
  const addLocation = (location: string | undefined) => { // warning: O(n2)
    if (location && !locations.includes(location)) { locations.push(location) }
  }
  addLocation(process.env.HOME && resolve(process.env.HOME, `.${appName}rc.js`)) // $HOME/.hbrc.js
  addLocation(await findUp({ filename: `.${appName}rc.js` })) // .hbrc.js in cwd and updirs
  return locations
}

export const loadConfiguration = async <T> (appName: string, base: T): Promise<T> => {
  // https://lodash.com/docs/4.17.11#mergeWith
  // customize arrays merge by concatenating instead of merging object at same index
  const customMerge = (to: any, from: any, key: string) => {
    if (Array.isArray(to) && Array.isArray(from)) {
      return to.concat(from)
    }
  }

  for (const location of await findLocations(appName)) {
    const contents = await configuration<T>(location)
    if (contents) {
      _.mergeWith(base, contents, customMerge)
    }
  }
  debug('Configuration available :', base)
  return base
}
