import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('map', () => {
  it('map', async () => {
    const f = (n: number) => n * 2
    const test = pipe(
      stream.fromArray([1, 2, 3]),
      stream.map(f),
      stream.toArray,
      task.map((mapped) => assert.deepStrictEqual(mapped, [2, 4, 6]))
    )

    await test()
  })
})
