
const isDebug = process.env.DEBUG === 'true'

type Logger = (...args: any[]) => void

const nolog: Logger = () => {}
const _debug: Logger = (...args) => console.error('🐞', ...args)

// logging is directed to stderr to avoid polluting stdout
// stdout will be used for printing strucured data, allowing building tooling around the cli

export const debug: Logger = isDebug ? _debug : nolog
export const log: Logger = console.error
export const fail: Logger = (...args) => log('❌ ', ...args)
export const warn: Logger = (...args) => log('⚠️ ', ...args)
export const success: Logger = (...args) => log('✅ ', ...args)
export const check: Logger = (...args) => log('✅ ', ...args)
export const stdout: Logger = console.log
