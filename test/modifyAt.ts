import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('modifyAt', () => {
  it('modifyAt', async () => {
    const double = (x: number): number => x * 2

    await pipe(
      stream.fromArray([1, 2, 3]),
      stream.modifyAt(1, double),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, [1, 4, 3]))
    )()

    await pipe(
      stream.zero<number>(),
      stream.modifyAt(1, double),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, []))
    )()
  })
})
