import { Awaitable } from './lib/types'
import { loadConfiguration } from './lib/config'
import { detect, Detector, DetectResult } from './lib/detect'

import { resolve } from 'path'

// --- Config Schema ---

export interface CmdDir {
  path: string
}

export interface TemplateFile {
  path: string
}

export interface HBConfig {
  templates: TemplateFile[]
  commands: CmdDir[]
  detectors: Detector[]
}

export const currentConfiguration = loadConfiguration<HBConfig>('hb', {
  templates: [
    { path: resolve(__dirname, './templates/node') }
  ],
  commands: [],
  detectors: [
    { path: resolve(__dirname, './env') }
  ]
})

// --- Resolved Config ---

export interface TemplateOptions {
  dryRun?: boolean
}

export interface Template {
  name: string
  description: string
  generate: (options: TemplateOptions) => Awaitable<void>
}

export interface HBResolvedConfig {
  templates: Template[]
  commands: CmdDir[]
  detected: DetectResult
}

const loadTemplates = async (files: TemplateFile[]): Promise<Template[]> => {
  const loadedFiles = await Promise.all(files.map(file => import(file.path)))
  return loadedFiles.map(loadedFile => loadedFile.default as Template)
}

const resolveConfig = async (): Promise<HBResolvedConfig> => {
  const config = await currentConfiguration
  // TODO: validate config

  const [ templates, detected ] = await Promise.all([
    loadTemplates(config.templates),
    detect(config.detectors)
  ])

  return {
    templates,
    commands: config.commands,
    detected
  }
}

export const resolvedConfiguration = resolveConfig()
