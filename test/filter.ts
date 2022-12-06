import * as assert from 'assert'
import { stream } from '../src'
import { pipe } from 'fp-ts/function'
import { task, string } from 'fp-ts'

describe('filter', () => {
  it('filter', async () => {
    const test1 = pipe(
      ['a', 1, {}, 'b', 5],
      stream.fromArray,
      stream.filter(string.isString),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, ['a', 'b']))
    )

    await test1()

    const test2 = pipe(
      [-3, 1, -2, 5],
      stream.fromArray,
      stream.filter((x: number) => x > 0),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [1, 5]))
    )

    await test2()
  })
})
