import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('prependAll', () => {
  it('prependAll', async () => {
    await pipe(
      stream.prependAll(9)(stream.fromArray([1, 2, 3, 4])),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, [9, 1, 9, 2, 9, 3, 9, 4]))
    )()
  })
})
