import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('makeBy', () => {
  it('makeBy', async () => {
    const double = (i: number): number => i * 2

    await pipe(
      stream.makeBy(5, double),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, [0, 2, 4, 6, 8]))
    )()

    await pipe(
      stream.makeBy(-3, double),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, []))
    )()

    await pipe(
      stream.makeBy(4.32164, double),
      stream.toArray,
      task.map((array) => assert.deepStrictEqual(array, [0, 2, 4, 6]))
    )()
  })
})
