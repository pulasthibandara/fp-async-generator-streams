import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('broadcast', () => {
  it('broadcast', async () => {
    const [s1, s2] = pipe(stream.fromArray([1, 2, 3, 4, 5, 6]), stream.broadcast)

    const test1 = pipe(
      s1,
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [1, 2, 3, 4, 5, 6]))
    )

    const test2 = pipe(
      s2,
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [1, 2, 3, 4, 5, 6]))
    )

    await pipe(task.sequenceArray([test1, test2]))()
  })
})
