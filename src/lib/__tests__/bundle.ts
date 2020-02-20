import { listBundles } from '../bundle'

test('listBundles', async () => {
  return expect(listBundles(`${__dirname}/__assets__/listBundle`)).resolves.toMatchSnapshot()
})

