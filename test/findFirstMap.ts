import * as assert from 'assert'
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from '../src'

describe('findFirstMap', () => {
  it('findFirstMap', async () => {
    interface Person {
      readonly name: string
      readonly age?: number
    }

    const persons: stream.Stream<Person> = stream.fromArray([
      { name: 'John' },
      { name: 'Mary', age: 45 },
      { name: 'Joey', age: 28 }
    ])

    await pipe(
      persons,
      stream.findFirstMap((person) => (person.age ? option.some(person.age) : option.none)),
      task.map((res) => assert.deepStrictEqual(option.some(45), res))
    )()
  })
})
