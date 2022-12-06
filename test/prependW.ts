import * as assert from 'assert'
import { stream } from '../src'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

describe('prependW', () => {
  it('prependW', async () => {
    await pipe(
      stream.fromArray([1, 2, 3, 4]),
      stream.prependW('zero'),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, ['zero', 1, 2, 3, 4]))
    )()
  })
})
