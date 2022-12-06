import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('mapWithIndex', () => {
  it('mapWithIndex', async () => {
    const f = (i: number, s: string) => `${s} - ${i}`
    const test = pipe(
      stream.fromArray(['a', 'b', 'c']),
      stream.mapWithIndex(f),
      stream.toArray,
      task.map((mapped) => assert.deepStrictEqual(mapped, ['a - 0', 'b - 1', 'c - 2']))
    )

    await test()
  })
})
