import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { io, task } from 'fp-ts'
import { stream } from '../src'

describe('fromIO', () => {
  it('fromIO', async () => {
    const test = pipe(
      stream.fromIO(io.of('abc')),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, ['abc']))
    )

    await test()
  })
})
