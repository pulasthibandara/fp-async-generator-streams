import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('fromRec', () => {
  it('Creates a stream from a recursive function', async () => {
    const test = pipe(
      ['a', 'b', 'c'],
      stream.fromArray,
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, ['a', 'b', 'c']))
    )

    await test()
  })

  it('could produce an large stream without stack overflow', async () => {
    const streamLength = 1_000_000
    const lastElementTask = pipe(
      stream.fromRange(0, streamLength),
      stream.execute((_, t) => t, -1)
    )
    const lastElement = await lastElementTask()
    assert.equal(lastElement, streamLength - 1)
  })
})
