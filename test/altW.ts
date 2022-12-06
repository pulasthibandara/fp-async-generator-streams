import * as assert from 'assert'
import { stream } from '../src'
import { task } from 'fp-ts'
import { pipe } from 'fp-ts/function'

describe('altW', () => {
  it('altW', async () => {
    const test = pipe(
      stream.fromArray([1, 2, 3]),
      stream.altW(() => stream.fromArray(['a', 'b'])),
      stream.toArray,
      task.map((combined) => assert.deepStrictEqual(combined, [1, 2, 3, 'a', 'b']))
    )

    await test()
  })
})
