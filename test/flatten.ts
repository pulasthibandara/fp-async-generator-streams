import * as assert from 'assert'
import { task } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { stream } from '../src'

describe('flatten', () => {
  it('flatten', async () => {
    await pipe(
      [['a'], ['b', 'c'], ['d', 'e', 'f']],
      stream.fromArray,
      // eslint-disable-next-line fp-ts/prefer-chain
      stream.map(stream.fromArray),
      stream.flatten,
      stream.toArray,
      task.map((flattened) => assert.deepStrictEqual(flattened, ['a', 'b', 'c', 'd', 'e', 'f']))
    )()
  })
})
