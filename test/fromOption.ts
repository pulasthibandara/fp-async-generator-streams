import * as assert from 'assert'
import { stream } from '../src'
import { option } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

describe('fromOption', () => {
  it('fromOption', async () => {
    await pipe(
      option.some('a'),
      stream.fromOption,
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, ['a']))
    )()

    await pipe(
      option.none,
      stream.fromOption,
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, []))
    )()
  })
})
