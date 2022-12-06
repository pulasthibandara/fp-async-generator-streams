import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('fromRec', () => {
  it('fromRec', async () => {
    const test = pipe(
      ['a', 'b', 'c'],
      stream.fromArray,
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, ['a', 'b', 'c']))
    )

    await test()
  })
})
