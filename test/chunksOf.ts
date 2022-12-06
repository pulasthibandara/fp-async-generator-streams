import * as fc from 'fast-check'
import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from '../src'

describe('chunksOf', () => {
  it('chunksOf', async () => {
    const test = pipe(
      stream.fromArray([1, 2, 3, 4, 5]),
      stream.chunksOf(2),
      stream.toArray,
      task.map((chunks) => assert.deepStrictEqual(chunks, [[1, 2], [3, 4], [5]]))
    )

    await test()
  })

  it('emits the last bach if it has any elements', async () => {
    const testStream = pipe(stream.fromRange(0, 5), stream.chunksOf(3))

    await pipe(
      testStream,
      stream.toArray,
      task.map((chunks) =>
        assert.deepStrictEqual(chunks, [
          [0, 1, 2],
          [3, 4]
        ])
      )
    )()
  })

  it('does not emit the last chunk if its empty', async () => {
    const testStream = pipe(stream.fromRange(0), stream.take(3), stream.chunksOf(3))

    await pipe(
      testStream,
      stream.toArray,
      task.map((chunks) => assert.deepStrictEqual(chunks, [[0, 1, 2]]))
    )()
  })

  it('chunks arbitrary sized chunks', async () => {
    const chunk = (chunkSize: number) => {
      return fc.array(fc.integer(), { minLength: chunkSize, maxLength: chunkSize })
    }

    const chunks = (chunkSize: number) => {
      const fullChunks = fc.array(chunk(chunkSize))

      const lastChunk = fc.array(fc.integer(), { minLength: 1, maxLength: chunkSize })

      const expect = fc.tuple(fullChunks, lastChunk).map(([full, last]) => [...full, last])

      return fc.record({
        chunkSize: fc.constant(chunkSize),
        expect
      })
    }

    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 10_000 }).chain(chunks), async ({ expect, chunkSize }) => {
        const chunked = pipe(stream.fromArray(expect.flat()), stream.chunksOf(chunkSize))

        await pipe(
          chunked,
          stream.toArray,
          task.map((chunks) => assert.deepStrictEqual(chunks, expect))
        )()
      })
    )
  })
})
