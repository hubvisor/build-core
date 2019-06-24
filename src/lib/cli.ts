import inquirer, { Question } from 'inquirer'
import autocompletePrompt from 'inquirer-autocomplete-prompt'
import fuzzy from 'fuzzy'

inquirer.registerPrompt('autocomplete', autocompletePrompt)

type Choice<T> = string | { name: string, value: T }

interface AutocompleteOptions<T> {
  message: string
  name: string
  choices: Array<Choice<T>>
}

export const autocomplete = <T>(options: AutocompleteOptions<T>): Question => {
  return {
    type: 'autocomplete',
    name: options.name,
    message: options.message,
    choices: options.choices,
    source: async (answers: any, input: string = '') => {
      // if it's an object, it means it's a choice object search among names (labels) else use the value itself
      const fuzzyResult = await fuzzy.filter(input, options.choices, {
        extract (item) {
          // if item is a 'Choice', return its value else return the item
          if (typeof item === 'string') {
            return item
          }
          return item.name
        }
      })
      return fuzzyResult.map(item => item.original)
    }
  } as unknown as Question
  // inquirer TS module does not allow custom question extensions
  // it's way too complicated to type so force the type
}

export const ask = async <T> (question: Question): Promise<T> => {
  const answers = await inquirer.prompt({
    ...question,
    name: 'result'
  })

  return answers['result'] as T
}
