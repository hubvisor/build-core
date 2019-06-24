import execa from 'execa'

const gitTag = async () => {
  return process.env.TRAVIS_TAG || execa('git', [ 'describe', '--tags' ]).then(res => res.stdout)
}

const yarnVersion = async () => {
  return execa('yarn', [ '--version' ]).then(res => res.stdout)
}

export const GIT_TAG = gitTag()
export const NODE_VERSION = process.version.replace(/^v/, '')
export const YARN_VERSION = yarnVersion()
