import assert from 'assert'
import { option, task } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { stream } from '../src'

describe('stream', () => {
  it('running the same stream multiple times will execute multiple iterations', async () => {
    const numberStream = pipe(stream.fromRange(0, 5))

    await pipe(
      numberStream,
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [0, 1, 2, 3, 4]))
    )()

    await pipe(
      numberStream,
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [0, 1, 2, 3, 4]))
    )()
  })

  it('is lazily evaluated', async () => {
    let isEvaluated = false
    const tracking = stream.fromRec((n: option.Option<number>) => {
      isEvaluated = true
      return pipe(
        n,
        option.map((r) => r + 1)
      )
    })

    const numberStream: stream.Stream<number> = pipe(tracking(option.some(0)), stream.take(5))

    assert.equal(isEvaluated, false)

    await pipe(
      numberStream,
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, [0, 1, 2, 3, 4]))
    )()

    assert.equal(isEvaluated, true)
  })
})
