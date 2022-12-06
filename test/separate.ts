import * as assert from 'assert'
import { stream } from '../src'
import { either, separated, apply, task } from 'fp-ts'
import { pipe } from 'fp-ts/function'

describe('separate', () => {
  it('separate', async () => {
    const test = pipe(
      stream.fromArray([either.right('r1'), either.left('l1'), either.right('r2')]),
      stream.separate,
      separated.bimap(stream.toArray, stream.toArray),
      ({ left, right }) => ({ left, right }),
      apply.sequenceS(task.task),
      task.map((res) =>
        assert.deepStrictEqual(res, {
          left: ['l1'],
          right: ['r1', 'r2']
        })
      )
    )

    await test()
  })
})
