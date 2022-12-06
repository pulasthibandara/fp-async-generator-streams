import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('updateAt', () => {
  it('updateAt', async () => {
    await pipe(
      stream.fromArray([1, 2, 3]),
      stream.updateAt(1, 1),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, [1, 1, 3]))
    )()

    await pipe(
      stream.zero<number>(),
      stream.updateAt(1, 1),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, []))
    )()
  })
})
