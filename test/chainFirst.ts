import * as assert from 'assert'
import { stream } from '../src'
import { task } from 'fp-ts'
import { pipe } from 'fp-ts/function'

describe('chainFirst', () => {
  it('chainFirst', async () => {
    const test1 = pipe(
      stream.fromArray([1, 2, 3]),
      stream.chainFirst(() => stream.fromArray(['a', 'b'])),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [1, 1, 2, 2, 3, 3]))
    )

    await test1()

    const test2 = pipe(
      stream.fromArray([1, 2, 3]),
      stream.chainFirst(() => stream.fromArray([])),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, []))
    )

    await test2()
  })
})
