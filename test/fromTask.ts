import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('fromTask', () => {
  it('fromTask', async () => {
    const test = pipe(
      stream.fromTask(task.of('abc')),
      stream.toArray,
      task.map((res) => assert.deepStrictEqual(res, ['abc']))
    )

    await test()
  })
})
