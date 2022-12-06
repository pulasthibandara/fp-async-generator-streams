import * as assert from 'assert'
import { stream } from '../src'
import { option, task } from 'fp-ts'
import { pipe } from 'fp-ts/function'

describe('compact', () => {
  it('compact', async () => {
    const test = pipe(
      stream.fromArray([option.some('a'), option.none, option.some('b')]),
      stream.compact,
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, ['a', 'b']))
    )

    await test()
  })
})
