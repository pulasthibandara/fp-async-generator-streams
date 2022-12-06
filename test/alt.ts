import * as assert from 'assert'
import { stream } from '../src'
import { task } from 'fp-ts'
import { pipe } from 'fp-ts/function'

describe('alt', () => {
  it('alt', async () => {
    const test = pipe(
      stream.fromArray([1, 2, 3]),
      stream.alt(() => stream.fromArray([4, 5])),
      stream.toArray,
      task.map((combined) => assert.deepStrictEqual(combined, [1, 2, 3, 4, 5]))
    )

    await test()
  })
})
