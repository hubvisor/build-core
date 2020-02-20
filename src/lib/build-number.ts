import admin from './firebase'

const db = admin.firestore()

export interface CurrentBuildNumberOptions {
  package: string
}

export const currentBuildNumber = async (options: CurrentBuildNumberOptions): Promise<number> => {
  const versions = db.collection('versions')
  const snapshot = await versions.where('package', '==', options.package).get()
  return snapshot.docs[0] ? snapshot.docs[0].get('build') : 1
}

interface BumpBuildNumberOptions {
  package: string
}

export const bumpBuildNumber = async (options: BumpBuildNumberOptions): Promise<number> => {
  const versions = db.collection('versions')
  return db.runTransaction(async t => {
    const snapshot = await t.get(versions.where('package', '==', options.package))
    const packageInfo = snapshot.docs[0]
    const build = packageInfo ? packageInfo.get('build') + 1 : 2 // assumes non-existing package version is 1 and bumped to 2
    if (packageInfo) {
      t.set(versions.doc(packageInfo.id), { build }, { merge: true })
    } else {
      t.set(versions.doc(), { package: options.package, build })
    }
    return build
  })
}
