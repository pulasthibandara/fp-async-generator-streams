import * as assert from 'assert'
import { stream } from '../src'
import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

describe('fromEither', () => {
  it('fromEither', async () => {
    await pipe(
      either.right('r'),
      stream.fromEither,
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, ['r']))
    )()

    await pipe(
      either.left('l'),
      stream.fromEither,
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, []))
    )()
  })
})
