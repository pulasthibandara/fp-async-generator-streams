import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('rotateLeft', () => {
  it('rotateLeft', async () => {
    await pipe(
      stream.rotateLeft(2)(stream.fromArray([1, 2, 3, 4, 5])),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, [3, 4, 5, 1, 2]))
    )()
  })
})
