import { debug, fail } from './log'
import { Awaitable } from './types'

export interface Detector {
  path: string
}

export type DetectResult = { [name: string]: string | undefined }

type DetectorsByName = { [name: string]: Promise<string | undefined> }
type FileDetectorsByName = { [name: string]: Awaitable<string | undefined> } // file can provide a value or a promise

export const detect = async (detectors: Detector[]): Promise<DetectResult> => {
  const detectorsByName: DetectorsByName = {}
  for (const detector of detectors) {
    try {
      const fileDetectors = require(detector.path) as FileDetectorsByName
      Object.entries(fileDetectors).forEach(([ name, value ]) => {
        detectorsByName[name] = Promise.resolve(value).catch(err => {
          fail(`Error while detecting '${name}'`)
          debug(err)
          return undefined // typescript wants us to return string | undefined; on error the variable will be undefined
        })
      })
    } catch (err) {
      fail(`Impossible to load env from '${detector}':\n`, err)
    }
  }

  const detected = await Promise.all(Object.entries(detectorsByName).map(([ name, eventualValue ]) => {
    return eventualValue.then(val => ({ [name]: val }))
  }))

  return Object.assign({}, ...detected)
}
