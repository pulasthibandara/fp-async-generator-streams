import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from '../src'

describe('findLastMapWithIndex', () => {
  it('findLastMapWithIndex', async () => {
    await pipe(
      stream.fromArray([1, 2, 3, 2, 4]),
      stream.findLastMapWithIndex((i, a) => (a === 2 ? option.some(`${i}-${a}`) : option.none)),
      task.map((res) => assert.deepStrictEqual(option.some('3-2'), res))
    )()

    await pipe(
      stream.fromArray([]),
      stream.findLastMapWithIndex((i, a) => (a === 2 ? option.some(`${i}-${a}`) : option.none)),
      task.map((res) => assert.deepStrictEqual(option.none, res))
    )()
  })
})
