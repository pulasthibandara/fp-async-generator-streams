import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task, number } from 'fp-ts'
import { stream } from '../src'

describe('elem', () => {
  it('elem', async () => {
    await pipe(
      stream.fromArray([1, 2, 3]),
      stream.elem(number.Eq)(2),
      task.map((res) => assert.equal(true, res))
    )()

    await pipe(
      stream.fromArray([1, 2, 3]),
      stream.elem(number.Eq)(0),
      task.map((res) => assert.equal(false, res))
    )()
  })
})
