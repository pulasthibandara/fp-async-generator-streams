import * as assert from 'assert'
import { stream } from '../src'
import { pipe } from 'fp-ts/function'
import { option, task } from 'fp-ts'

describe('filterMap', () => {
  it('filterMap', async () => {
    const f = (s: string) => (s.length === 1 ? option.some(s.toUpperCase()) : option.none)

    const test = pipe(
      ['a', 'no', 'neither', 'b'],
      stream.fromArray,
      stream.filterMap(f),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, ['A', 'B']))
    )

    await test()
  })
})
