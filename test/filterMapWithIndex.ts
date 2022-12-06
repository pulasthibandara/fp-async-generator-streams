import * as assert from 'assert'
import { stream } from '../src'
import { pipe } from 'fp-ts/function'
import { option, task } from 'fp-ts'

describe('filterMapWithIndex', () => {
  it('filterMapWithIndex', async () => {
    const f = (i: number, s: string) => (i % 2 === 1 ? option.some(s.toUpperCase()) : option.none)

    const test = pipe(
      ['a', 'no', 'neither', 'b'],
      stream.fromArray,
      stream.filterMapWithIndex(f),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, ['NO', 'B']))
    )

    await test()
  })
})
