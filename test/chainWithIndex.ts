import * as assert from 'assert'
import { stream } from '../src'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

describe('chainWithIndex', () => {
  it('chainWithIndex', async () => {
    const f = (index: number, x: string) => stream.replicate(2, `${x}${index}`)
    const test = pipe(
      stream.fromArray(['a', 'b', 'c']),
      stream.chainWithIndex(f),
      stream.toArray,
      task.map((chained) => assert.deepStrictEqual(chained, ['a0', 'a0', 'b1', 'b1', 'c2', 'c2']))
    )

    await test()
  })
})
