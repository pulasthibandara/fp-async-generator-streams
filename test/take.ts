import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('take', () => {
  it('take', async () => {
    const stream1To5 = stream.fromRange(1, 6)

    await pipe(
      stream1To5,
      stream.take(2),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [1, 2]))
    )()

    await pipe(
      stream1To5,
      stream.take(7),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [1, 2, 3, 4, 5]))
    )()

    await pipe(
      stream1To5,
      stream.take(0),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, []))
    )()

    await pipe(
      stream1To5,
      stream.take(-1),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, []))
    )()
  })
})
