import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('drop', () => {
  it('drop', async () => {
    const stream1To3 = stream.fromRange(1, 4)

    await pipe(
      stream1To3,
      stream.drop(2),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [3]))
    )()

    await pipe(
      stream1To3,
      stream.drop(5),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, []))
    )()

    await pipe(
      stream1To3,
      stream.drop(0),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [1, 2, 3]))
    )()

    await pipe(
      stream1To3,
      stream.drop(-2),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [1, 2, 3]))
    )()
  })
})
