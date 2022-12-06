import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task, apply } from 'fp-ts'
import { stream } from '../src'

describe('unzip', () => {
  it('unzip', async () => {
    await pipe(
      stream.unzip(
        stream.fromArray([
          [1, 'a'],
          [2, 'b'],
          [3, 'c']
        ])
      ),
      ([a, b]) => [stream.toArray(a), stream.toArray(b)] as const,
      (t) => apply.sequenceT(task.ApplyPar)(...t),
      task.map(([arrayA, arrayB]) => {
        assert.deepStrictEqual(arrayA, [1, 2, 3])
        assert.deepStrictEqual(arrayB, ['a', 'b', 'c'])
      })
    )()
  })
})
