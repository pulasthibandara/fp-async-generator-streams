import * as assert from 'assert'
import { stream } from '../src'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

describe('filterWithIndex', () => {
  it('filterWithIndex', async () => {
    const f = (index: number, x: number) => x > 0 && index <= 2

    const test = pipe(
      [-3, 1, -2, 5],
      stream.fromArray,
      stream.filterWithIndex(f),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [1]))
    )

    await test()
  })
})
