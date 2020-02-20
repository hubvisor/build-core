import { CommandBuilder } from 'yargs'

export const command = 'workspace'
export const desc = 'Executes a workspace-related task'
export const builder: CommandBuilder = yargs => yargs.commandDir('workspace').demandCommand()
