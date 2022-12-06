import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('insertAt', () => {
  it('insertAt', async () => {
    await pipe(
      stream.fromArray([1, 2, 3, 4]),
      stream.insertAt(2, 5),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, [1, 2, 5, 3, 4]))
    )()

    await pipe(
      stream.fromArray([1, 2, 3, 4]),
      stream.insertAt(4, 5),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, [1, 2, 3, 4, 5]))
    )()
  })
})
