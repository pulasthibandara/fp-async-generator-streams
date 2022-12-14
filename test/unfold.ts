import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { option, task } from 'fp-ts'
import { stream } from '../src'

describe('unfold', () => {
  it('unfold', async () => {
    const f = (n: number) => {
      if (n <= 0) return option.none
      const returnValue = n * 2
      const inputForNextRound = n - 1
      return option.some([returnValue, inputForNextRound] as const)
    }

    const test = pipe(
      stream.unfold(5, f),
      stream.toArray,
      task.map((unfolded) => assert.deepStrictEqual(unfolded, [10, 8, 6, 4, 2]))
    )

    await test()
  })

  it('could produce an large stream without stack overflow', async () => {
    const streamLength = 1_000_000
    const lastElementTask = pipe(
      stream.unfold(0, (r) => (r < streamLength ? option.some([r, r + 1]) : option.none)),
      stream.execute((_, t) => t, -1)
    )
    const lastElement = await lastElementTask()
    assert.equal(lastElement, streamLength - 1)
  })
})
