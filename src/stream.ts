/**
 * @since 0.1.0
 */

import {
  alt as catAlt,
  alternative,
  applicative,
  apply,
  array,
  chain as chain_,
  compactable,
  either,
  eq,
  filterable,
  filterableWithIndex,
  fromEither as fromEither_,
  fromTask as fromTask_,
  functor,
  functorWithIndex,
  io,
  monad,
  monoid,
  option,
  pointed,
  predicate,
  refinement,
  semigroup,
  separated,
  task,
  taskOption,
  tuple,
  unfoldable,
  zero as catZero
} from 'fp-ts'
import { flow, identity, Lazy, pipe, tupled, tuple as toTuple } from 'fp-ts/function'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * A light-weight, lazy, async generator based stream implementation.
 *
 * @category model
 * @since 0.1.0
 */
export type Stream<A> = () => AsyncGenerator<A, void, undefined>

/**
 * @category instances
 * @since 0.1.0
 */
export const URI = 'Stream'

/**
 * @category instances
 * @since 0.1.0
 */
export type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly [URI]: Stream<A>
  }
}

// -------------------------------------------------------------------------------------
// type class members
// -------------------------------------------------------------------------------------

/**
 * Makes an single element stream `Stream`, useful for building a [`Applicative`](#Applicative)
 *
 * @category constructors
 * @since 0.1.0
 */
export const of: pointed.Pointed1<URI>['of'] = (a) =>
  async function* () {
    yield a
  }

/**
 * Makes an empty `Stream`, useful for building a [`Monoid`](#Monoid)
 *
 * @category constructors
 * @since 0.1.0
 */
export const zero: <A>() => Stream<A> = () => fromArray([])

export const execute =
  <T, A>(fn: (agg: A, t: T) => A, init: A) =>
  (stream: Stream<T>) =>
  async (): Promise<A> => {
    let agg = init
    for await (const item of stream()) {
      agg = fn(agg, item)
    }

    return agg
  }

/**
 * Convert a `Stream` to an `Array`
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.fromArray([1, 2, 3]),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual([1, 2, 3], res))
 * )()
 *
 * pipe(
 *  stream.fromArray([]),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual([], res))
 * )()
 *
 * @since 0.1.0
 */
export const toArray = <T>(stream: Stream<T>) => execute<T, Array<T>>((agg, c) => [...agg, c], Array<T>())(stream)

/**
 * Get length of a stream.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.fromArray([1, 2, 3]),
 *  stream.length,
 *  task.map(res => assert.deepStrictEqual(3, res))
 * )()
 *
 * pipe(
 *  stream.fromArray([]),
 *  stream.length,
 *  task.map(res => assert.deepStrictEqual(0, res))
 * )()
 *
 * @since 0.1.0
 */
export const length = <T>(stream: Stream<T>) => execute<T, number>((agg) => agg + 1, 0)(stream)

/**
 * This function provides a safe way to read a value at a particular index from an stream.
 * It returns a `none` if the index is out of bounds, and a `some` of the element if the
 * index is valid.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.fromArray([1, 2, 3]),
 *  stream.lookup(1),
 *  task.map(res => assert.deepStrictEqual(option.some(2), res))
 * )()
 *
 * pipe(
 *  stream.fromArray([1, 2, 3]),
 *  stream.lookup(3),
 *  task.map(res => assert.deepStrictEqual(option.none, res))
 * )()
 *
 * @since 0.1.0
 */
export const lookup =
  (idx: number) =>
  <A>(as: Stream<A>): task.Task<option.Option<A>> =>
    pipe(
      as,
      filterWithIndex((i) => i === idx),
      head
    )

/**
 * Get the last element in an stream, or `None` if the stream is empty
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.fromArray([1, 2, 3]),
 *  stream.last,
 *  task.map(res => assert.deepStrictEqual(option.some(3), res))
 * )()
 *
 * pipe(
 *  stream.fromArray([]),
 *  stream.last,
 *  task.map(res => assert.deepStrictEqual(option.none, res))
 * )()
 *
 * @since 0.1.0
 */
export const last = <T>(stream: Stream<T>): task.Task<option.Option<T>> =>
  pipe(
    stream,
    execute<T, option.Option<T>>((_, c) => option.some(c), option.none)
  )

/**
 * Get the first element in an stream, or `None` if the stream is empty
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.fromArray([1, 2, 3]),
 *  stream.head,
 *  task.map(res => assert.deepStrictEqual(option.some(1), res))
 * )()
 *
 * pipe(
 *  stream.fromArray([]),
 *  stream.head,
 *  task.map(res => assert.deepStrictEqual(option.none, res))
 * )()
 *
 * @since 0.1.0
 */
export const head = <T>(stream: Stream<T>): task.Task<option.Option<T>> => pipe(stream, take(1), last)

/**
 * Find the first index for which a predicate holds and return tuple of element and index
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.fromArray([1, 2, 3, 2, 4]),
 *  stream.findFirstMapWithIndex((i, a) => a === 2 ? option.some(`${i}-${a}`) : option.none),
 *  task.map(res => assert.deepStrictEqual(option.some("1-2"), res))
 * )()
 *
 * pipe(
 *  stream.fromArray([]),
 *  stream.findFirstMapWithIndex((i, a) => a === 2 ? option.some(`${i}-${a}`) : option.none),
 *  task.map(res => assert.deepStrictEqual(option.none, res))
 * )()
 *
 * @since 0.1.0
 */
export const findFirstMapWithIndex = <A, B>(
  f: (i: number, a: A) => option.Option<B>
): ((as: Stream<A>) => task.Task<option.Option<B>>) =>
  flow(
    filterMapWithIndex((i, a) => f(i, a)),
    head
  )

/**
 * Find the first index for which a predicate holds
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.fromArray([1, 2, 3]),
 *  stream.findIndex((a) => a === 2),
 *  task.map(res => assert.deepStrictEqual(option.some(1), res))
 * )()
 *
 * pipe(
 *  stream.fromArray([]),
 *  stream.findIndex((a) => a === 2),
 *  task.map(res => assert.deepStrictEqual(option.none, res))
 * )()
 *
 * @since 0.1.0
 */
export const findIndex = <A>(
  predicate: predicate.Predicate<A>
): ((as: Stream<A>) => task.Task<option.Option<number>>) =>
  findFirstMapWithIndex((i, a) => (predicate(a) ? option.some(i) : option.none))

/**
 * Find the first element which satisfies a predicate (or a refinement) function
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * type X = {
 *   readonly a: number
 *   readonly b: number
 * }
 *
 * const isA1 = (x: X) => x.a === 1
 *
 * pipe(
 *  stream.fromArray([{ a: 1, b: 1 }, { a: 1, b: 2 }]),
 *  stream.findFirst(isA1),
 *  task.map(res => assert.deepStrictEqual(option.some({ a: 1, b: 1 }), res))
 * )()
 *
 * @since 0.1.0
 */
export function findFirst<A, B extends A>(
  refinement: refinement.Refinement<A, B>
): (as: Stream<A>) => taskOption.TaskOption<B>
export function findFirst<A>(
  predicate: predicate.Predicate<A>
): <B extends A>(bs: Stream<B>) => taskOption.TaskOption<B>
export function findFirst<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => taskOption.TaskOption<A>
export function findFirst<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => taskOption.TaskOption<A> {
  return findFirstMapWithIndex((_, a) => (predicate(a) ? option.some(a) : option.none))
}

/**
 * Find the first element returned by an option based selector function
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * interface Person {
 *   readonly name: string
 *   readonly age?: number
 * }
 *
 * const persons: stream.Stream<Person> = stream.fromArray([{ name: 'John' }, { name: 'Mary', age: 45 }, { name: 'Joey', age: 28 }])
 *
 * pipe(
 *  persons,
 *  stream.findFirstMap(person => person.age ? option.some(person.age) : option.none),
 *  task.map(res => assert.deepStrictEqual(option.some(45), res))
 * )()
 *
 * @since 0.1.0
 */
export const findFirstMap = <A, B>(f: (a: A) => option.Option<B>): ((as: Stream<A>) => taskOption.TaskOption<B>) =>
  findFirstMapWithIndex((_, a) => f(a))

/**
 * Find the last index for which a predicate holds and return tuple of element and index
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.fromArray([1, 2, 3, 2, 4]),
 *  stream.findLastMapWithIndex((i, a) => a === 2 ? option.some(`${i}-${a}`) : option.none),
 *  task.map(res => assert.deepStrictEqual(option.some("3-2"), res))
 * )()
 *
 * pipe(
 *  stream.fromArray([]),
 *  stream.findLastMapWithIndex((i, a) => a === 2 ? option.some(`${i}-${a}`) : option.none),
 *  task.map(res => assert.deepStrictEqual(option.none, res))
 * )()
 *
 * @since 0.1.0
 */
export const findLastMapWithIndex = <A, B>(
  f: (i: number, a: A) => option.Option<B>
): ((as: Stream<A>) => task.Task<option.Option<B>>) =>
  flow(
    filterMapWithIndex((i, a) => f(i, a)),
    last
  )

/**
 * Find the last element which satisfies a predicate function
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * type X = {
 *   readonly a: number
 *   readonly b: number
 * }
 *
 * pipe(
 *  stream.fromArray([{ a: 1, b: 1 }, { a: 1, b: 2 }]),
 *  stream.findLast((x) => x.a === 1),
 *  task.map(res => assert.deepStrictEqual(option.some({ a: 1, b: 2 }), res))
 * )
 *
 * @since 0.1.0
 */
export function findLast<A, B extends A>(
  refinement: refinement.Refinement<A, B>
): (as: Stream<A>) => taskOption.TaskOption<B>
export function findLast<A>(predicate: predicate.Predicate<A>): <B extends A>(bs: Stream<B>) => taskOption.TaskOption<B>
export function findLast<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => taskOption.TaskOption<A>
export function findLast<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => taskOption.TaskOption<A> {
  return findLastMapWithIndex((_, a) => option.fromPredicate(predicate)(a))
}

/**
 * Find the last element returned by an option based selector function
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * interface Person {
 *   readonly name: string
 *   readonly age?: number
 * }
 *
 * const persons: stream.Stream<Person> = stream.fromArray([{ name: 'John' }, { name: 'Mary', age: 45 }, { name: 'Joey', age: 28 }])
 *
 * pipe(
 *  persons,
 *  stream.findLastMap(person => person.age ? option.some(person.age) : option.none),
 *  task.map(res => assert.deepStrictEqual(option.some(28), res))
 * )()
 *
 * @since 0.1.0
 */
export const findLastMap = <A, B>(f: (a: A) => option.Option<B>): ((as: Stream<A>) => taskOption.TaskOption<B>) =>
  findLastMapWithIndex((_, a) => f(a))

/**
 * Find the last index for which a predicate holds
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.fromArray([1, 2, 3, 2, 4]),
 *  stream.findLastIndex((a) => a === 2),
 *  task.map(res => assert.deepStrictEqual(option.some(3), res))
 * )()
 *
 * pipe(
 *  stream.fromArray([]),
 *  stream.findLastIndex((a) => a === 2),
 *  task.map(res => assert.deepStrictEqual(option.none, res))
 * )()
 *
 * @since 0.1.0
 */
export const findLastIndex = <A>(
  predicate: predicate.Predicate<A>
): ((as: Stream<A>) => task.Task<option.Option<number>>) =>
  findLastMapWithIndex((i, a) => (predicate(a) ? option.some(i) : option.none))

/**
 * Test if a value is a member of an `Stream`. Takes a `Eq<A>` as a single
 * argument which returns the function to use to search for a value of type `A` in
 * an `Stream<A>`.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, number } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.fromArray([1, 2, 3]),
 *  stream.elem(number.Eq)(2),
 *  task.map(res => assert.equal(true, res))
 * )()
 *
 * pipe(
 *  stream.fromArray([1, 2, 3]),
 *  stream.elem(number.Eq)(0),
 *  task.map(res => assert.equal(false, res))
 * )()
 *
 * @since 0.1.0
 */
export const elem =
  <A>(E: eq.Eq<A>) =>
  (a: A) =>
  (as: Stream<A>): task.Task<boolean> =>
    pipe(
      as,
      findFirst((x) => E.equals(x, a)),
      task.map(option.isSome)
    )

/**
 * Creates a new `Stream` removing duplicate elements, keeping the first occurrence of an element,
 * based on a `Eq<A>`.
 *
 * This is a naive implementation, which uses an array to store the encountered elements and has
 * a memory complexity of O(n) where n is the number of uniq elements in the `Stream`.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, number } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.fromArray([1, 2, 1]),
 *  stream.uniq(number.Eq),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual([1, 2], res))
 * )()
 *
 * @since 0.1.0
 */
export const uniq =
  <A>(E: eq.Eq<A>) =>
  (as: Stream<A>): Stream<A> =>
    async function* () {
      let seen: Array<A> = []

      for await (const a of as()) {
        const isSeen = pipe(
          seen,
          array.exists((x) => E.equals(x, a))
        )

        if (!isSeen) {
          seen = [...seen, a]
          yield a
        }
      }
    }

/**
 * Broadcast the stream to another stream without consuming multiple times
 * from the source.
 *
 * If one consumer is slower than the other, the slower consumer will
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, number } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const [s1, s2] = pipe(
 *  stream.fromArray([1, 2, 3, 4, 5, 6]),
 *  stream.broadcast,
 * )
 *
 * const test1 = pipe(
 *  s1,
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, [1, 2, 3, 4, 5, 6]))
 * )
 *
 * const test2 = pipe(
 *  s2,
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, [1, 2, 3, 4, 5, 6]))
 * )
 *
 * pipe(
 *  task.sequenceArray([test1, test2]),
 * )()
 *
 * @since 0.1.0
 */
export const broadcast = <A>(as: Stream<A>): [Stream<A>, Stream<A>] => {
  const iterator = as()[Symbol.asyncIterator]()

  let bufferA: Array<A> = []
  let bufferB: Array<A> = []
  let aConsumed = false
  let bConsumed = false

  return [
    async function* () {
      if (aConsumed) {
        throw new Error('Broadcasted stream already consumed')
      }

      aConsumed = true

      while (true) {
        const { value, done } = await iterator.next()

        const temp = bufferA
        bufferA = []
        bufferB.push(...(value === undefined ? [] : [value]))
        yield* [...temp, ...(value === undefined ? [] : [value])]

        if (done && !bufferA.length) {
          return
        }
      }
    },
    async function* () {
      if (bConsumed) {
        throw new Error('Broadcasted stream already consumed')
      }

      bConsumed = true

      while (true) {
        const { value, done } = await iterator.next()

        const temp = bufferB
        bufferB = []
        bufferA.push(...(value === undefined ? [] : [value]))
        yield* [...temp, ...(value === undefined ? [] : [value])]

        if (done && !bufferB.length) {
          return
        }
      }
    }
  ]
}

/**
 * Get all but the last element of an stream.
 * An empty stream is returned if the input stream contains one or less elements.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.fromArray([1, 2, 3]),
 *  stream.init,
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, [1, 2]))
 * )()
 *
 * pipe(
 *  stream.fromArray([]),
 *  stream.init,
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, []))
 * )()
 *
 * @since 0.1.0
 */
export const init = <A>(as: Stream<A>): Stream<A> =>
  async function* () {
    const gen = as()
    let buffer: option.Option<A> = option.none

    for await (const a of gen) {
      if (option.isSome(buffer)) {
        yield buffer.value
      }

      buffer = option.some(a)
    }
  }

/**
 * Keep only a max number of elements from the start of an `Stream`, creating a new `Stream`.
 *
 * **Note**. `n` is normalized to a non negative integer.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const stream1To5 = stream.fromRange(1, 6)
 *
 * pipe(
 *  stream1To5,
 *  stream.take(2),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, [1, 2]))
 * )()
 *
 * pipe(
 *  stream1To5,
 *  stream.take(7),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, [1, 2, 3, 4, 5]))
 * )()
 *
 * pipe(
 *   stream1To5,
 *   stream.take(0),
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, []))
 * )()
 *
 * pipe(
 *   stream1To5,
 *   stream.take(-1),
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, []))
 * )()
 *
 * @since 0.1.0
 */
export const take =
  (n: number) =>
  <T>(gen: Stream<T>): Stream<T> =>
    async function* () {
      let count = 0

      for await (const item of gen()) {
        if (count >= n) {
          break
        }

        count++
        yield item
      }
    }

/**
 * Calculate the longest initial subarray for which all element satisfy the specified predicate, creating a new array
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *   [2, 4, 3, 6],
 *   stream.fromArray,
 *   stream.takeWhile((n: number) => n % 2 == 0),
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, [2, 4]))
 * )()
 *
 * @since 0.1.0
 */
export function takeWhile<A, B extends A>(refinement: refinement.Refinement<A, B>): (as: Stream<A>) => Stream<B>
export function takeWhile<A>(predicate: predicate.Predicate<A>): <B extends A>(bs: Stream<B>) => Stream<B>
export function takeWhile<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => Stream<A>
export function takeWhile<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => Stream<A> {
  return (as: Stream<A>) =>
    async function* () {
      for await (const a of as()) {
        if (!predicate(a)) {
          return
        }

        yield a
      }
    }
}

/**
 * Creates a new `Stream` which is a copy of the input dropping a max number of elements from the start.
 *
 * **Note**. `n` is normalized to a non negative integer.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const stream1To3 = stream.fromRange(1, 4)
 *
 * pipe(
 *  stream1To3,
 *  stream.drop(2),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, [3]))
 * )()
 *
 * pipe(
 *  stream1To3,
 *  stream.drop(5),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, []))
 * )()
 *
 * pipe(
 *  stream1To3,
 *  stream.drop(0),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, [1, 2, 3]))
 * )()
 *
 * pipe(
 *  stream1To3,
 *  stream.drop(-2),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, [1, 2, 3]))
 * )()
 *
 * @since 0.1.0
 */
export const drop =
  (n: number) =>
  <A>(as: Stream<A>): Stream<A> =>
    async function* () {
      let count = 0

      for await (const a of as()) {
        if (count >= n) {
          yield a
        }

        count++
      }
    }

/**
 * Creates a new `Stream` which is a copy of the input dropping the longest initial substream for
 * which all element satisfy the specified predicate.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  ["c", "b", "a", "c", "e"],
 *  stream.fromArray,
 *  stream.dropWhileIndex((idx: number, c: string) => c !== "c" || idx < 3 ),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, ["c", "e"]))
 * )()
 *
 * @since 0.1.0
 */
export function dropWhileIndex<A, B extends A>(
  refinement: filterableWithIndex.RefinementWithIndex<number, A, B>
): (as: Stream<A>) => Stream<B>
export function dropWhileIndex<A>(
  predicate: filterableWithIndex.PredicateWithIndex<number, A>
): <B extends A>(bs: Stream<B>) => Stream<B>
export function dropWhileIndex<A>(
  predicate: filterableWithIndex.PredicateWithIndex<number, A>
): (as: Stream<A>) => Stream<A>
export function dropWhileIndex<A>(
  predicate: filterableWithIndex.PredicateWithIndex<number, A>
): (as: Stream<A>) => Stream<A> {
  return (as) =>
    async function* () {
      let idx = 0
      let yielding = false

      for await (const a of as()) {
        if (yielding) {
          yield a
        } else if (!predicate(idx, a)) {
          yielding = true
          yield a
        }

        idx++
      }
    }
}

/**
 * Creates a new `Stream` which is a copy of the input dropping the longest initial substream for
 * which all element satisfy the specified predicate.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  [1, 3, 2, 4, 5],
 *  stream.fromArray,
 *  stream.dropWhile((n: number) => n % 2 == 1),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, [2, 4, 5]))
 * )()
 *
 * @since 0.1.0
 */
export function dropWhile<A, B extends A>(refinement: refinement.Refinement<A, B>): (as: Stream<A>) => Stream<B>
export function dropWhile<A>(predicate: predicate.Predicate<A>): <B extends A>(bs: Stream<B>) => Stream<B>
export function dropWhile<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => Stream<A>
export function dropWhile<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => Stream<A> {
  return (as) => dropWhileIndex<A>((_, a) => predicate(a))(as)
}

/**
 * Type returned by [`spanLeft`](#spanLeft) composed of an `init` Stream and a `rest` Stream.
 *
 * @since 2.10.0
 */
export type Spanned<I, R> = {
  init: Stream<I>
  rest: Stream<R>
}

/**
 * Split an stream into two parts:
 * 1. the longest initial substream for which all elements satisfy the specified predicate
 * 2. the remaining elements
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, option, apply } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const isOdd = (n: number) => n % 2 === 1;
 *
 * pipe(
 *  [1, 3, 2, 4, 5],
 *  stream.fromArray,
 *  stream.spanLeft(isOdd),
 *  ({ init, rest }) => apply.sequenceS(task.task)({ init: stream.toArray(init), rest: stream.toArray(rest) }),
 *  task.map(res => assert.deepStrictEqual(res, { init: [1, 3], rest: [2, 4, 5] }))
 * )()
 *
 * pipe(
 *  [0, 2, 4, 5],
 *  stream.fromArray,
 *  stream.spanLeft(isOdd),
 *  ({ init, rest }) => apply.sequenceS(task.task)({ init: stream.toArray(init), rest: stream.toArray(rest) }),
 *  task.map(res => assert.deepStrictEqual(res, { init: [], rest: [0, 2, 4, 5] }))
 * )()
 *
 * pipe(
 *  [1, 3, 5],
 *  stream.fromArray,
 *  stream.spanLeft(isOdd),
 *  ({ init, rest }) => apply.sequenceS(task.task)({ init: stream.toArray(init), rest: stream.toArray(rest) }),
 *  task.map(res => assert.deepStrictEqual(res, { init: [1, 3, 5], rest: [] }))
 * )()
 *
 * @since 0.1.0
 */
export function spanLeft<A, B extends A>(refinement: refinement.Refinement<A, B>): (as: Stream<A>) => Spanned<B, A>
export function spanLeft<A>(predicate: predicate.Predicate<A>): <B extends A>(bs: Stream<B>) => Spanned<B, B>
export function spanLeft<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => Spanned<A, A>
export function spanLeft<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => Spanned<A, A> {
  return flow(broadcast, tuple.bimap(dropWhile(predicate), takeWhile(predicate)), ([init, rest]) => ({ init, rest }))
}

/**
 * Splits a stream into length-`n` pieces. The last piece will be shorter if `n` does not evenly divide the length of
 * the stream. Note that `chunksOf(n)(stream.fromArray([]))` is `[]`, not `[[]]`. This is intentional, and is consistent with a recursive
 * definition of `chunksOf`; it satisfies the property that
 *
 * ```ts
 * chunksOf(n)(xs).concat(chunksOf(n)(ys)) == chunksOf(n)(xs.concat(ys)))
 * ```
 *
 * whenever `n` evenly divides the length of `xs`.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const test =
 *   pipe(
 *     stream.fromArray([1, 2, 3, 4, 5]),
 *     stream.chunksOf(2),
 *     stream.toArray,
 *     task.map(
 *       chunks => assert.deepStrictEqual(chunks, [[1, 2], [3, 4], [5]])
 *     ),
 *   )
 *
 * test()
 *
 * @since 0.1.0
 */
export const chunksOf =
  (chunkSize: number) =>
  <T>(gen: Stream<T>): Stream<Array<T>> =>
    async function* () {
      let _chunk: Array<T> = []
      for await (const item of gen()) {
        if (_chunk.length < chunkSize) {
          _chunk.push(item)
        } else {
          yield _chunk
          _chunk = [item]
        }
      }

      if (_chunk.length) {
        yield _chunk
      }
    }

/**
 * Same as [`map`](#map), but the iterating function takes both the index and the value
 * of the element.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const f = (i: number, s: string) => `${s} - ${i}`;
 * const test =
 *  pipe(
 *    stream.fromArray(["a", "b", "c"]),
 *    stream.mapWithIndex(f),
 *    stream.toArray,
 *    task.map(mapped => assert.deepStrictEqual(mapped, ["a - 0", "b - 1", "c - 2"]))
 *  )
 *
 * test()
 *
 * @category mapping
 * @since 0.1.0
 */
export const mapWithIndex =
  <A, B>(fn: (idx: number, a: A) => B) =>
  (gen: Stream<A>): Stream<B> =>
    async function* () {
      let idx = 0

      for await (const item of gen()) {
        yield fn(idx, item)
        idx++
      }
    }

/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: Stream<A>) => Stream<B>`.
 * In practice it applies the base function to each element of the stream and collects the
 * results in a new stream.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const f = (n: number) => n * 2;
 * const test =
 *  pipe(
 *    stream.fromArray([1, 2, 3]),
 *    stream.map(f),
 *    stream.toArray,
 *    task.map(mapped => assert.deepStrictEqual(mapped, [2, 4, 6]))
 *  )
 *
 * test()
 *
 * @category mapping
 * @since 0.1.0
 */
export const map =
  <A, B>(fn: (a: A) => B) =>
  (gen: Stream<A>): Stream<B> =>
    async function* () {
      for await (const item of gen()) {
        yield fn(item)
      }
    }

/**
 * Same as [`chain`](#chain), but passing also the index to the iterating function.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 *
 * const f = (index: number, x: string) => stream.replicate(2, `${x}${index}`);
 * const test =
 *  pipe(
 *    stream.fromArray(["a", "b", "c"]),
 *    stream.chainWithIndex(f),
 *    stream.toArray,
 *    task.map(chained => assert.deepStrictEqual(chained, ["a0", "a0", "b1", "b1", "c2", "c2"]))
 *  )
 *
 * test()
 *
 * @category sequencing
 * @since 0.1.0
 */
export const chainWithIndex =
  <A, B>(f: (i: number, a: A) => Stream<B>) =>
  (as: Stream<A>): Stream<B> =>
    async function* () {
      let idx = 0
      for await (const item of as()) {
        for await (const b of f(idx, item)()) {
          yield b
        }

        idx++
      }
    }

/**
 * A useful recursion pattern for processing a `ReadonlyNonEmptyArray` to produce a new `ReadonlyNonEmptyArray`, often used for "chopping" up the input
 * `ReadonlyNonEmptyArray`. Typically `chop` is called with some function that will consume an initial prefix of the `ReadonlyNonEmptyArray` and produce a
 * value and the tail of the `ReadonlyNonEmptyArray`.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { pipe } from 'fp-ts/function'
 * import { task, number, eq } from 'fp-ts'
 *
 * const group = <A>(S: eq.Eq<A>): ((as: stream.Stream<A>) => stream.Stream<Array<A>>) => {
 *   return stream.chop(as => async () => {
 *     const [s1, s2] = pipe(
 *       as,
 *       stream.broadcast,
 *     )
 *
 *     const head = await pipe(
 *       s1,
 *       stream.take(1),
 *       stream.toArray,
 *     )()
 *
 *     const { init, rest } = pipe(
 *       s2,
 *       stream.spanLeft((a: A) => S.equals(a, head[0])),
 *     )
 *
 *     const chunked = await stream.toArray(init)()
 *     return [chunked, rest]
 *   })
 * }
 *
 * const groupedStream = pipe(
 *  stream.fromArray([1, 1, 2, 3, 3, 4]),
 *  group(number.Eq),
 * )
 *
 * pipe(
 *  groupedStream,
 *  stream.toArray,
 *  task.map(chopped => assert.deepStrictEqual(chopped, [[1, 1], [2], [3, 3], [4]]))
 * )()
 *
 * @since 2.10.0
 */
export const chop =
  <A, B>(f: (as: Stream<A>) => task.Task<readonly [B, Stream<A>]>) =>
  (as: Stream<A>): Stream<B> =>
    async function* () {
      const [b, rest] = await f(as)()
      yield b

      let next: Stream<A> = rest

      while (true) {
        const iterator = next()[Symbol.asyncIterator]()
        const { value, done } = await iterator.next()

        if (done) {
          return
        }

        const [b, rest] = await f(pipe(() => iterator, prepend(value)))()

        yield b

        next = rest
      }
    }

/**
 * Splits a `Stream` into two pieces, the first piece has max `n` elements.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { pipe } from 'fp-ts/function'
 * import { task, array } from 'fp-ts'
 *
 * pipe(
 *  stream.fromArray([1, 2, 3, 4, 5]),
 *  stream.splitAt(2),
 *  array.traverse(task.task)(stream.toArray),
 *  task.map(split => assert.deepStrictEqual(split, [[1, 2], [3, 4, 5]]))
 * )()
 *
 * @since 0.1.0
 */
export const splitAt = (n: number): (<A>(as: Stream<A>) => [Stream<A>, Stream<A>]) =>
  flow(broadcast, tuple.bimap(drop(n), take(n)))

/**
 * Composes computations in sequence, using the return value of one computation to
 * determine the next computation.
 *
 * In other words it takes a function `f` that produces a stream from a single element of
 * the base type `A` and returns a new function which applies `f` to each element of the
 * input stream (like [`map`](#map)) and, instead of returning a stream of streams, concatenates the
 * results into a single stream (like [`flatten`](#flatten)).
 *
 * This is the `chain` component of the stream `Monad`.
 *
 * @example
 * import { task, array } from 'fp-ts'
 * import { pipe } from 'fp-ts/function'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const f = (n: number) => stream.replicate(n, `${n}`);
 * const test =
 *  pipe(
 *    stream.fromArray([1, 2, 3]),
 *    stream.chain(f),
 *    stream.toArray,
 *    task.map(chained => assert.deepStrictEqual(chained, ['1', '2', '2', '3', '3', '3']))
 *  )
 *
 * test()
 *
 * @category sequencing
 * @since 0.1.0
 */
export const chain = <A, B>(f: (a: A) => Stream<B>): ((as: Stream<A>) => Stream<B>) => chainWithIndex((_, a) => f(a))

/**
 * Takes an stream of streams of `A` and flattens them into an stream of `A`
 * by concatenating the elements of each stream in order.
 *
 * @example
 * import { task, array } from 'fp-ts'
 * import { pipe } from 'fp-ts/function'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  [["a"], ["b", "c"], ["d", "e", "f"]],
 *  stream.fromArray,
 *  stream.map(stream.fromArray),
 *  stream.flatten,
 *  stream.toArray,
 *  task.map(flattened => assert.deepStrictEqual(flattened, ["a", "b", "c", "d", "e", "f"]))
 * )()
 *
 * @category sequencing
 * @since 0.1.0
 */
export const flatten: <A>(mma: Stream<Stream<A>>) => Stream<A> = /*#__PURE__*/ chain(identity)

/**
 * Less strict version of [`alt`](#alt).
 *
 * The `W` suffix (short for **W**idening) means that the return types will be merged.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { task } from 'fp-ts'
 * import { pipe } from 'fp-ts/function'
 *
 * const test =
 *   pipe(
 *     stream.fromArray([1, 2, 3]),
 *     stream.altW(() => stream.fromArray(['a', 'b'])),
 *     stream.toArray,
 *     task.map(combined => assert.deepStrictEqual(combined, [1, 2, 3, 'a', 'b']))
 *   )
 *
 * test()
 *
 * @category error handling
 * @since 0.1.0
 */
export const altW =
  <B>(that: Lazy<Stream<B>>) =>
  <A>(fa: Stream<A>): Stream<A | B> => {
    const S = getSemigroup<A | B>()
    return S.concat(fa, that())
  }

/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * In case of `Stream` concatenates the inputs into a single stream.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { task } from 'fp-ts'
 * import { pipe } from 'fp-ts/function'
 *
 * const test =
 *   pipe(
 *     stream.fromArray([1, 2, 3]),
 *     stream.alt(() => stream.fromArray([4, 5])),
 *     stream.toArray,
 *     task.map(combined => assert.deepStrictEqual(combined, [1, 2, 3, 4, 5]))
 *   )
 *
 * test()
 *
 * @category error handling
 * @since 0.1.0
 */
export const alt: <A>(that: Lazy<Stream<A>>) => (fa: Stream<A>) => Stream<A> = altW

/**
 * `unfold` takes a function `f` which returns an `Option` of a tuple containing an outcome
 * value and an input for the following iteration.
 * `unfold` applies `f` to the initial value `b` and then recursively to the second
 * element of the tuple contained in the returned `option` of the previous
 * calculation until `f` returns `Option.none`.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { option, task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const f = (n: number) => {
 *   if (n <= 0) return option.none;
 *   const returnValue = n * 2;
 *   const inputForNextRound = n - 1;
 *   return option.some([returnValue, inputForNextRound] as const);
 * };
 *
 * const test =
 *  pipe(
 *   stream.unfold(5, f),
 *   stream.toArray,
 *   task.map(unfolded => assert.deepStrictEqual(unfolded, [10, 8, 6, 4, 2])),
 *  )
 *
 * test()
 *
 * @category constructors
 * @since 0.1.0
 */
export const unfold = <A, B>(b: B, f: (b: B) => option.Option<readonly [A, B]>): Stream<A> =>
  async function* () {
    let bb = b
    while (true) {
      const mt = f(bb)
      if (option.isNone(mt)) {
        return
      }

      const [a, b] = mt.value
      yield a
      bb = b
    }
  }

/**
 * Return a `Array` of length `n` with element `i` initialized with `f(i)`.
 *
 * **Note**. `n` is normalized to a non negative integer.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { option, task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const double = (i: number): number => i * 2
 *
 * pipe(
 *  stream.makeBy(5, double),
 *  stream.toArray,
 *  task.map(array => assert.deepStrictEqual(array, [0, 2, 4, 6, 8]))
 * )()
 *
 * pipe(
 *  stream.makeBy(-3, double),
 *  stream.toArray,
 *  task.map(array => assert.deepStrictEqual(array, []))
 * )()
 *
 * pipe(
 *  stream.makeBy(4.32164, double),
 *  stream.toArray,
 *  task.map(array => assert.deepStrictEqual(array, [0, 2, 4, 6]))
 * )()
 *
 * @category constructors
 * @since 0.1.0
 */
export const makeBy = <A>(n: number, f: (i: number) => A): Stream<A> =>
  async function* () {
    const j = Math.max(0, Math.floor(n))
    for (let i = 0; i < j; i++) {
      yield f(i)
    }
  }

/**
 * Create a `Stream` containing a value repeated the specified number of times.
 *
 * **Note**. `n` is normalized to a non negative integer.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { option, task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 *
 * pipe(
 *   stream.replicate(3, 'a'),
 *   stream.toArray,
 *   task.map(array => assert.deepStrictEqual(array, ['a', 'a', 'a']))
 * )()
 *
 * pipe(
 *   stream.replicate(-3, 'a'),
 *   stream.toArray,
 *   task.map(array => assert.deepStrictEqual(array, []))
 * )()
 *
 * pipe(
 *   stream.replicate(2.985647, 'a'),
 *   stream.toArray,
 *   task.map(array => assert.deepStrictEqual(array, ['a', 'a']))
 * )()
 *
 * @category constructors
 * @since 0.1.0
 */
export const replicate = <A>(n: number, a: A): Stream<A> => makeBy(n, () => a)

/**
 * Insert an element at the specified index, creating a new stream.
 * If the index is out of bounds, the original stream is returned.
 *
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { option, task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.fromArray([1, 2, 3, 4]),
 *  stream.insertAt(2, 5),
 *  stream.toArray,
 *  task.map(array => assert.deepStrictEqual(array, [1, 2, 5, 3, 4]))
 * )()
 *
 * pipe(
 *  stream.fromArray([1, 2, 3, 4]),
 *  stream.insertAt(4, 5),
 *  stream.toArray,
 *  task.map(array => assert.deepStrictEqual(array, [1, 2, 3, 4, 5]))
 * )()
 *
 * @since 0.1.0
 */
export const insertAt =
  <A>(i: number, a: A) =>
  (as: Stream<A>): Stream<A> =>
    async function* () {
      let j = 0
      for await (const item of as()) {
        j++
        yield item

        if (j === i) {
          yield a
        }
      }
    }

/**
 * Apply a function to the element at the specified index, creating a new array,
 * or return the original array if the index is out of bounds.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { option, task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const double = (x: number): number => x * 2
 *
 * pipe(
 *  stream.fromArray([1, 2, 3]),
 *  stream.modifyAt(1, double),
 *  stream.toArray,
 *  task.map(array => assert.deepStrictEqual(array, [1, 4, 3]))
 * )()
 *
 * pipe(
 *  stream.zero<number>(),
 *  stream.modifyAt(1, double),
 *  stream.toArray,
 *  task.map(array => assert.deepStrictEqual(array, []))
 * )()
 *
 * @since 0.1.0
 */
export const modifyAt =
  <A>(i: number, f: (a: A) => A) =>
  (as: Stream<A>): Stream<A> =>
    async function* () {
      let j = 0
      for await (const item of as()) {
        yield j === i ? f(item) : item
        j++
      }
    }

/**
 * Change the element at the specified index, creating a new stream.
 * If the index is out of bounds, the original stream is returned.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { option, task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.fromArray([1, 2, 3]),
 *  stream.updateAt(1, 1),
 *  stream.toArray,
 *  task.map(array => assert.deepStrictEqual(array, [1, 1, 3]))
 * )()
 *
 * pipe(
 *  stream.zero<number>(),
 *  stream.updateAt(1, 1),
 *  stream.toArray,
 *  task.map(array => assert.deepStrictEqual(array, []))
 * )()
 *
 * @since 0.1.0
 */
export const updateAt = <A>(i: number, a: A): ((as: Stream<A>) => Stream<A>) => modifyAt(i, () => a)

/**
 * Apply a function to pairs of elements at the same index in two streams, collecting the results in a new stream. If one
 * input stream is short, excess elements of the longer stream are discarded.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { option, task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.zipWith(
 *    stream.fromArray([1, 2, 3]),
 *    stream.fromArray(['a', 'b', 'c', 'd']),
 *     (a, b) => a + b,
 *  ),
 *  stream.toArray,
 *  task.map(array => assert.deepStrictEqual(array, ['1a', '2b', '3c']))
 * )()
 *
 * @since 0.1.0
 */
export const zipWith = <A, B, C>(fa: Stream<A>, fb: Stream<B>, f: (a: A, b: B) => C): Stream<C> =>
  async function* () {
    const iteratorA = fa()[Symbol.asyncIterator]()
    const iteratorB = fb()[Symbol.asyncIterator]()
    while (true) {
      const { value: a, done: doneA } = await iteratorA.next()
      const { value: b, done: doneB } = await iteratorB.next()

      if (doneA || doneB) {
        return
      }

      yield f(a, b)
    }
  }

/**
 * Takes two streams and returns an stream of corresponding pairs. If one input stream is short, excess elements of the
 * longer stream are discarded
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { option, task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.zip(
 *    stream.fromArray([1, 2, 3]),
 *    stream.fromArray(['a', 'b', 'c', 'd']),
 *  ),
 *  stream.toArray,
 *  task.map(array => assert.deepStrictEqual(array, [[1, 'a'], [2, 'b'], [3, 'c']]))
 * )()
 *
 * @since 0.1.0
 */
export function zip<B>(bs: Stream<B>): <A>(as: Stream<A>) => Stream<readonly [A, B]>
export function zip<A, B>(as: Stream<A>, bs: Stream<B>): Stream<readonly [A, B]>
export function zip<A, B>(
  as: Stream<A>,
  bs?: Stream<B>
): Stream<readonly [A, B]> | ((bs: Stream<B>) => Stream<readonly [B, A]>) {
  if (bs === undefined) {
    return (bs) => zip(bs, as)
  }
  return zipWith(as, bs, toTuple)
}

/**
 * The function is reverse of `zip`. Takes an array of pairs and return two corresponding arrays.
 * This buffers the one output stream, if its slower than the other.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { option, task, apply } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.unzip(stream.fromArray([[1, 'a'], [2, 'b'], [3, 'c']])),
 *  ([a, b]) => [stream.toArray(a), stream.toArray(b)] as const,
 *  t => apply.sequenceT(task.ApplyPar)(...t),
 *  task.map(([arrayA, arrayB]) => {
 *    assert.deepStrictEqual(arrayA, [1, 2, 3])
 *    assert.deepStrictEqual(arrayB, ['a', 'b', 'c'])
 *  })
 * )()
 *
 * @since 0.1.0
 */
export const unzip = <A, B>(as: Stream<readonly [A, B]>): readonly [Stream<A>, Stream<B>] => {
  return pipe(
    broadcast(as),
    tuple.bimap(
      map(([_, b]) => b),
      map(([a]) => a)
    )
  )
}

/**
 * Creates a new `Stream`, prepending an element to every member of the input `Stream`.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.prependAll(9)(stream.fromArray([1, 2, 3, 4])),
 *  stream.toArray,
 *  task.map(array => assert.deepStrictEqual(array, [9, 1, 9, 2, 9, 3, 9, 4]))
 * )
 *
 * @since 2.10.0
 */
export const prependAll = <A>(middle: A): ((as: Stream<A>) => Stream<A>) => chain((a) => fromArray([middle, a]))

/**
 * Creates a new `Stream` placing an element in between members of the input `Stream`.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 *
 * pipe(
 *  stream.intersperse(9)(stream.fromArray([1, 2, 3, 4])),
 *  stream.toArray,
 *  task.map(array => assert.deepStrictEqual(array, [1, 9, 2, 9, 3, 9, 4]))
 * )
 *
 * @since 0.1.0
 */
export const intersperse = <A>(middle: A): ((as: Stream<A>) => Stream<A>) => flow(prependAll(middle), drop(1))

/**
 * Creates a new `Stream` rotating the input `Stream` by `n` steps.
 * `n` elements will get buffered in memory.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * pipe(
 *  stream.rotate(2)(stream.fromArray([1, 2, 3, 4, 5])),
 *  stream.toArray,
 *  task.map(array => assert.deepStrictEqual(array, [4, 5, 1, 2, 3]))
 * )
 *
 * @since 0.1.0
 */
export const rotate =
  (n: number) =>
  <A>(as: Stream<A>): Stream<A> =>
    async function* () {
      let idx = 0
      const buffer: Array<A> = []

      for await (const a of as()) {
        if (idx < n) {
          buffer.push(a)
        } else {
          yield a
        }

        idx++
      }

      yield* buffer
    }

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * Create a stream from a recursive function.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const test =
 *  pipe(
 *    ["a", "b", "c"],
 *    stream.fromArray,
 *    stream.toArray,
 *    task.map(res => assert.deepStrictEqual(res, ["a", "b", "c"]))
 *  )
 *
 * test()
 *
 * @category conversions
 * @since 0.1.0
 */
export const fromRec =
  <A>(fn: (a: option.Option<A>) => option.Option<A>) =>
  (init: option.Option<A>): Stream<A> =>
    async function* () {
      let next = init

      // Using an iteration here to support stack safety
      do {
        if (option.isSome(next)) {
          yield next.value
        }

        next = fn(next)
      } while (option.isSome(next))
    }

/**
 * Create a stream of single element from the value of a  Task.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const test =
 *  pipe(
 *    stream.fromTask(task.of("abc")),
 *    stream.toArray,
 *    task.map(res => assert.deepStrictEqual(res, ["abc"]))
 *  )
 *
 * test()
 *
 * @category conversions
 * @since 0.1.0
 */
export const fromTask = <A>(task: task.Task<A>): Stream<A> =>
  async function* () {
    yield task()
  }

/**
 * Create a stream of single element from the value of a  IO.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { io, task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const test =
 *  pipe(
 *    stream.fromIO(io.of("abc")),
 *    stream.toArray,
 *    task.map(res => assert.deepStrictEqual(res, ["abc"]))
 *  )
 *
 * test()
 *
 * @category conversions
 * @since 0.1.0
 */
export const fromIO = <A>(effect: io.IO<A>): Stream<A> =>
  async function* () {
    yield effect()
  }

/**
 * Create a stream from a range of numbers.
 *
 * @param start The start of the range (inclusive)
 * @param end The end of the range (exclusive)
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const test =
 *  pipe(
 *    stream.fromRange(0, 5),
 *    stream.toArray,
 *    task.map(res => assert.deepStrictEqual(res, [0, 1, 2, 3, 4]))
 *  )
 *
 * test()
 *
 * @category conversions
 * @since 0.1.0
 */
export const fromRange = (start: number, end: number = Number.POSITIVE_INFINITY): Stream<number> =>
  pipe(
    option.some(start),
    fromRec(
      flow(
        option.map((r) => r + 1),
        option.filter((r) => r < end)
      )
    )
  )

/**
 * Create a stream from an `Array`.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const test =
 *  pipe(
 *    ["a", "b", "c"],
 *    stream.fromArray,
 *    stream.toArray,
 *    task.map(res => assert.deepStrictEqual(res, ["a", "b", "c"]))
 *  )
 *
 * test()
 *
 * @category conversions
 * @since 0.1.0
 */
export const fromArray = <A>(array: ReadonlyArray<A>): Stream<A> =>
  async function* () {
    yield* array
  }

/**
 * @category lifting
 * @since 0.1.0
 */
export const fromArrayK =
  <A, B>(array: (a: A) => Array<B>) =>
  (a: A): Stream<B> =>
    fromArray(array(a))

/**
 * Create a stream with one element, if the element satisfies the predicate, otherwise
 * it returns an empty stream.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { pipe } from 'fp-ts/function'
 * import { isString } from "fp-ts/lib/string";
 * import { task } from 'fp-ts'
 *
 * pipe(
 *   "a",
 *   stream.fromPredicate(isString),
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, ["a"]))
 * )()
 *
 * pipe(
 *   7,
 *   stream.fromPredicate(isString),
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, []))
 * )()
 *
 * pipe(
 *   7,
 *   stream.fromPredicate((x)=> x > 0),
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, [7]))
 * )()
 *
 * pipe(
 *   -3,
 *   stream.fromPredicate((x)=> x > 0),
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, []))
 * )()
 *
 * @category lifting
 * @since 2.11.0
 */
export function fromPredicate<A, B extends A>(refinement: refinement.Refinement<A, B>): (a: A) => Stream<B>
export function fromPredicate<A>(predicate: predicate.Predicate<A>): <B extends A>(b: B) => Stream<B>
export function fromPredicate<A>(predicate: predicate.Predicate<A>): (a: A) => Stream<A>
export function fromPredicate<A>(predicate: predicate.Predicate<A>): (a: A) => Stream<A> {
  return (a) => (predicate(a) ? of(a) : zero())
}

// -------------------------------------------------------------------------------------
// conversions
// -------------------------------------------------------------------------------------

/**
 * Create an stream from an `Option`. The resulting stream will contain the content of the
 * `Option` if it is `Some` and it will be empty if the `Option` is `None`.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { option } from "fp-ts";
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 *
 * pipe(
 *   option.some("a"),
 *   stream.fromOption,
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, ["a"]))
 * )()
 *
 * pipe(
 *   option.none,
 *   stream.fromOption,
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, []))
 * )()
 *
 * @category conversions
 * @since 2.11.0
 */
export const fromOption: <A>(fa: option.Option<A>) => Stream<A> = (ma) => (option.isNone(ma) ? zero() : of(ma.value))

/**
 * Create an stream from an `Either`. The resulting stream will contain the content of the
 * `Either` if it is `Right` and it will be empty if the `Either` is `Left`.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { either } from "fp-ts";
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 *
 * pipe(
 *   either.right("r"),
 *   stream.fromEither,
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, ["r"]))
 * )()
 *
 * pipe(
 *   either.left("l"),
 *   stream.fromEither,
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, []))
 * )()
 *
 * @category conversions
 * @since 2.11.0
 */
export const fromEither: <A>(fa: either.Either<unknown, A>) => Stream<A> = (e) =>
  either.isLeft(e) ? zero() : of(e.right)

/**
 * Given an iterating function that is a `Predicate` or a `Refinement`,
 * `partition` creates two new `Streams`s: `right` containing the elements of the original
 * `Stream` for which the iterating function is `true`, `left` containing the elements
 * for which it is false.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { separated, apply } from "fp-ts";
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 * import { isString } from "fp-ts/lib/string";
 *
 * pipe(
 *   ["a", 1, {}, "b", 5],
 *   stream.fromArray,
 *   stream.partition(isString),
 *   separated.bimap(stream.toArray, stream.toArray),
 *   ({ left, right }) => ({ left, right }),
 *   apply.sequenceS(task.task),
 *   task.map(res => assert.deepStrictEqual(res, {
 *     left: [1, {}, 5],
 *     right: ["a", "b"],
 *   })),
 * )()
 *
 * pipe(
 *   [-3, 1, -2, 5],
 *   stream.fromArray,
 *   stream.partition((x: number) => x > 0),
 *   separated.bimap(stream.toArray, stream.toArray),
 *   ({ left, right }) => ({ left, right }),
 *   apply.sequenceS(task.task),
 *   task.map(res => assert.deepStrictEqual(res, {
 *     left: [-3, -2],
 *     right: [1, 5],
 *   })),
 * )()
 *
 * @category filtering
 * @since 0.1.0
 */
export const partition: {
  <A, B extends A>(refinement: refinement.Refinement<A, B>): (
    as: Stream<A>
  ) => separated.Separated<Stream<A>, Stream<B>>
  <A>(predicate: predicate.Predicate<A>): <B extends A>(bs: Stream<B>) => separated.Separated<Stream<B>, Stream<B>>
  <A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => separated.Separated<Stream<A>, Stream<A>>
} = <A>(predicate: predicate.Predicate<A>): ((as: Stream<A>) => separated.Separated<Stream<A>, Stream<A>>) =>
  partitionWithIndex((_, a) => predicate(a))

/**
 * Same as [`partition`](#partition), but passing also the index to the iterating function.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { separated } from "fp-ts";
 * import { pipe } from 'fp-ts/function'
 * import { task, apply } from 'fp-ts'
 *
 * pipe(
 *   [-2, 5, 6, 7],
 *   stream.fromArray,
 *   stream.partitionWithIndex((index, x: number) => index < 3 && x > 0),
 *   separated.bimap(stream.toArray, stream.toArray),
 *   ({ left, right }) => ({ left, right }),
 *   apply.sequenceS(task.task),
 *   task.map(res => assert.deepStrictEqual(res, {
 *     left: [-2, 7],
 *     right: [5, 6],
 *   })),
 * )()
 *
 * @category filtering
 * @since 0.1.0
 */
export const partitionWithIndex: {
  <A, B extends A>(refinementWithIndex: filterableWithIndex.RefinementWithIndex<number, A, B>): (
    as: Stream<A>
  ) => separated.Separated<Stream<A>, Stream<B>>
  <A>(predicateWithIndex: filterableWithIndex.PredicateWithIndex<number, A>): <B extends A>(
    bs: Stream<B>
  ) => separated.Separated<Stream<B>, Stream<B>>
  <A>(predicateWithIndex: filterableWithIndex.PredicateWithIndex<number, A>): (
    as: Stream<A>
  ) => separated.Separated<Stream<A>, Stream<A>>
} =
  <A>(predicateWithIndex: filterableWithIndex.PredicateWithIndex<number, A>) =>
  (as: Stream<A>): separated.Separated<Stream<A>, Stream<A>> =>
    pipe(
      as,
      mapWithIndex(
        flow(
          toTuple,
          either.fromPredicate(tupled(predicateWithIndex), ([_, a]) => a),
          either.map(([_, a]) => a)
        )
      ),
      separate
    )

/**
 * Given an iterating function that returns an `Either`,
 * `partitionMap` applies the iterating function to each element and it creates two `Streams`s:
 * `right` containing the values of `Right` results, `left` containing the values of `Left` results.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { separated, either, apply } from "fp-ts";
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 *
 * const upperIfString = <B>(x: B): either.Either<B, string> =>
 *   typeof x === "string" ? either.right(x.toUpperCase()) : either.left(x);
 *
 * pipe(
 *   [-2, "hello", 6, 7, "world"],
 *   stream.fromArray,
 *   stream.partitionMap(upperIfString),
 *   separated.bimap(stream.toArray, stream.toArray),
 *   ({ left, right }) => ({ left, right }),
 *   apply.sequenceS(task.task),
 *   task.map(res => assert.deepStrictEqual(res, {
 *     left: [-2, 6, 7],
 *     right: [ 'HELLO', 'WORLD' ],
 *   })),
 * )()
 *
 * @category filtering
 * @since 0.1.0
 */
export const partitionMap: <A, B, C>(
  f: (a: A) => either.Either<B, C>
) => (fa: Stream<A>) => separated.Separated<Stream<B>, Stream<C>> = (f) => partitionMapWithIndex((_, a) => f(a))

/**
 * Same as [`partitionMap`](#partitionMap), but passing also the index to the iterating function.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { separated, either, apply } from "fp-ts";
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 *
 * const upperIfStringBefore3 = <B>(index: number, x: B): either.Either<B, string> =>
 *   index < 3 && typeof x === "string" ? either.right(x.toUpperCase()) : either.left(x);
 *
 * pipe(
 *   [-2, "hello", 6, 7, "world"],
 *   stream.fromArray,
 *   stream.partitionMapWithIndex(upperIfStringBefore3),
 *   separated.bimap(stream.toArray, stream.toArray),
 *   ({ left, right }) => ({ left, right }),
 *   apply.sequenceS(task.task),
 *   task.map(res => assert.deepStrictEqual(res, {
 *     left: [-2, 6, 7, "world"],
 *     right: [ 'HELLO' ],
 *   })),
 * )()
 *
 * @category filtering
 * @since 0.1.0
 */
export const partitionMapWithIndex =
  <A, B, C>(f: (i: number, a: A) => either.Either<B, C>) =>
  (fa: Stream<A>): separated.Separated<Stream<B>, Stream<C>> =>
    pipe(
      fa,
      mapWithIndex((i, a) => f(i, a)),
      separate
    )

/**
 * Maps a stream with an iterating function that takes the index and the value of
 * each element and returns an `Option`. It keeps only the `Some` values discarding
 * the `None`s.
 *
 * Same as [`filterMap`](#filterMap), but with an iterating function which takes also
 * the index as input.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { pipe } from 'fp-ts/function'
 * import { option, task } from "fp-ts";
 *
 * const f = (i: number, s: string) => (i % 2 === 1 ? option.some(s.toUpperCase()) : option.none);
 *
 * const test =
 *  pipe(
 *    ["a", "no", "neither", "b"],
 *    stream.fromArray,
 *    stream.filterMapWithIndex(f),
 *    stream.toArray,
 *    task.map(res => assert.deepStrictEqual(res, ["NO", "B"]))
 *  )
 *
 * test()
 *
 * @category filtering
 * @since 0.1.0
 */
export const filterMapWithIndex =
  <A, B>(f: (i: number, a: A) => option.Option<B>) =>
  (fa: Stream<A>): Stream<B> =>
    async function* () {
      let idx = 0

      for await (const item of fa()) {
        const optionB = f(idx, item)
        if (option.isSome(optionB)) {
          yield optionB.value
        }

        idx++
      }
    }

/**
 * Given an iterating function that is a `Predicate` or a `Refinement`,
 * `filter` creates a new `stream` containing the elements of the original
 * `Stream` for which the iterating function is `true`.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { isString } from "fp-ts/lib/string";
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 *
 * const test1 =
 *    pipe(
 *      ["a", 1, {}, "b", 5],
 *      stream.fromArray,
 *      stream.filter(isString),
 *      stream.toArray,
 *      task.map(res => assert.deepStrictEqual(res, ["a", "b"]))
 *    )
 *
 * test1()
 *
 * const test2 =
 *    pipe(
 *      [-3, 1, -2, 5],
 *      stream.fromArray,
 *      stream.filter((x:number) => x > 0),
 *      stream.toArray,
 *      task.map(res => assert.deepStrictEqual(res, [1, 5]))
 *    )
 *
 * test2()
 *
 * @category filtering
 * @since 0.1.0
 */
export const filter =
  <A>(fn: predicate.Predicate<A>) =>
  (s: Stream<A>): Stream<A> =>
    async function* () {
      for await (const item of s()) {
        if (fn(item)) {
          yield item
        }
      }
    }

/**
 * Maps a stream with an iterating function that returns an `Option`
 * and it keeps only the `Some` values discarding the `None`s.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { pipe } from 'fp-ts/function'
 * import { option, task } from "fp-ts";
 *
 * const f = (s: string) => s.length === 1 ? option.some(s.toUpperCase()) : option.none;
 *
 * const test =
 *  pipe(
 *    ["a", "no", "neither", "b"],
 *    stream.fromArray,
 *    stream.filterMap(f),
 *    stream.toArray,
 *    task.map(res => assert.deepStrictEqual(res, ["A", "B"]))
 *  )
 *
 * test()
 *
 * @category filtering
 * @since 0.1.0
 */
export const filterMap: <A, B>(f: (a: A) => option.Option<B>) => (fa: Stream<A>) => Stream<B> = (f) =>
  filterMapWithIndex((_, a) => f(a))

/**
 * Same as [`filter`](#filter), but passing also the index to the iterating function.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { pipe } from 'fp-ts/function'
 * import { task } from "fp-ts";
 *
 * const f = (index: number, x: number) => x > 0 && index <= 2;
 *
 * const test =
 *  pipe(
 *    [-3, 1, -2, 5],
 *    stream.fromArray,
 *    stream.filterWithIndex(f),
 *    stream.toArray,
 *    task.map(res => assert.deepStrictEqual(res, [1])),
 *  )
 *
 * test()
 *
 * @category filtering
 * @since 0.1.0
 */
export const filterWithIndex: {
  <A, B extends A>(refinementWithIndex: filterableWithIndex.RefinementWithIndex<number, A, B>): (
    as: Stream<A>
  ) => Stream<B>
  <A>(predicateWithIndex: filterableWithIndex.PredicateWithIndex<number, A>): <B extends A>(bs: Stream<B>) => Stream<B>
  <A>(predicateWithIndex: filterableWithIndex.PredicateWithIndex<number, A>): (as: Stream<A>) => Stream<A>
} =
  <A>(predicateWithIndex: filterableWithIndex.PredicateWithIndex<number, A>) =>
  (as: Stream<A>): Stream<A> =>
    pipe(
      as,
      filterMapWithIndex((i, a) => (predicateWithIndex(i, a) ? option.some(a) : option.none))
    )

/**
 * Compact a stream of `Option`s discarding the `None` values and
 * keeping the `Some` values. It returns a new stream containing the values of
 * the `Some` options.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { option, task } from "fp-ts";
 * import { pipe } from 'fp-ts/function'
 *
 * const test =
 *  pipe(
 *   stream.fromArray([option.some("a"), option.none, option.some("b")]),
 *   stream.compact,
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, ["a", "b"]))
 *  )
 *
 * test()
 *
 * @category filtering
 * @since 0.1.0
 */
export const compact: <A>(fa: Stream<option.Option<A>>) => Stream<A> = /*#__PURE__*/ filterMap(identity)

/**
 * Separate a stream of `Either`s into `Left`s and `Right`s, creating two new streams:
 * one containing all the left values and one containing all the right values.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { either, separated, apply, task } from "fp-ts";
 * import { pipe } from 'fp-ts/function'
 *
 * const test =
 *  pipe(
 *   stream.fromArray([either.right("r1"), either.left("l1"), either.right("r2")]),
 *   stream.separate,
 *   separated.bimap(stream.toArray, stream.toArray),
 *   ({ left, right }) => ({ left, right }),
 *   apply.sequenceS(task.task),
 *   task.map(res => assert.deepStrictEqual(res, {
 *     left: ["l1"],
 *     right: ["r1", "r2"],
 *   })),
 *  )
 *
 * test()
 *
 * @category filtering
 * @since 0.1.0
 */
export const separate = <A, B>(fa: Stream<either.Either<A, B>>): separated.Separated<Stream<A>, Stream<B>> => {
  return pipe(
    broadcast(fa),
    ([left, right]) => ({ left, right }),
    separated.bimap(filterMap(option.getLeft), filterMap(option.getRight))
  )
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { pipe } from 'fp-ts/function'
 * import { task } from "fp-ts";
 *
 * pipe(
 *  stream.fromArray([1, 2, 3]),
 *  stream.isEmpty,
 *  task.map(res => assert.deepStrictEqual(res, false))
 * )()
 *
 * pipe(
 *  stream.fromArray([]),
 *  stream.isEmpty,
 *  task.map(res => assert.deepStrictEqual(res, true))
 * )()
 *
 * @category utils
 * @since 0.1.0
 */
export const isEmpty: (stream: Stream<unknown>) => task.Task<boolean> = execute(() => false, true)

/**
 * @category utils
 */
export const isNonEmpty: (stream: Stream<unknown>) => task.Task<boolean> = flow(
  isEmpty,
  task.map((r) => !r)
)

/**
 * Prepend an element to the front of a `Stream`, creating a new `Stream
 * Less strict version of [`prepend`](#prepend).
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { pipe } from 'fp-ts/function'
 * import { task } from "fp-ts";
 *
 * pipe(
 *  stream.fromArray([1, 2, 3, 4]),
 *  stream.prependW("zero"),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, ["zero", 1, 2, 3, 4]))
 * )
 *
 * @category utils
 */
export const prependW =
  <B>(head: B) =>
  <A>(tail: Stream<A>): Stream<A | B> =>
    async function* () {
      yield head
      yield* tail()
    }

/**
 * Prepend an element to the front of a `Stream`, creating a new `Stream`.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { pipe } from 'fp-ts/function'
 * import { task } from "fp-ts";
 *
 * pipe(
 *  stream.fromArray([1, 2, 3, 4]),
 *  stream.prepend(0),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, [0, 1, 2, 3, 4]))
 * )
 *
 * @since 2.10.0
 */
export const prepend: <A>(head: A) => (tail: Stream<A>) => Stream<A> = prependW

/**
 * Less strict version of [`append`](#append).
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { pipe } from 'fp-ts/function'
 * import { task } from "fp-ts";
 *
 * pipe(
 *  stream.fromArray([0, 1, 2, 3]),
 *  stream.appendW("four"),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, [0, 1, 2, 3, "four"]))
 * )
 *
 * @since 2.11.0
 */
export const appendW =
  <A, B>(end: B) =>
  (init: Stream<A>): Stream<A | B> =>
    async function* () {
      yield* init()
      yield end
    }

/**
 * Append an element to the end of a `Stream`, creating a new `Stream`.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { pipe } from 'fp-ts/function'
 * import { task } from "fp-ts";
 *
 * pipe(
 *  stream.fromArray([0, 1, 2, 3]),
 *  stream.append(4),
 *  stream.toArray,
 *  task.map(res => assert.deepStrictEqual(res, [0, 1, 2, 3, 4]))
 * )
 *
 * @since 2.10.0
 */
export const append: <A>(end: A) => (init: Stream<A>) => Stream<A> = appendW

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const _mapWithIndex: functorWithIndex.FunctorWithIndex1<URI, number>['mapWithIndex'] = (fa, f) =>
  pipe(fa, mapWithIndex(f))
const _map: functor.Functor1<URI>['map'] = (fa, f) => pipe(fa, map(f))
const _filter: filterable.Filterable1<URI>['filter'] = <A>(fa: Stream<A>, predicate: predicate.Predicate<A>) =>
  pipe(fa, filter(predicate))
const _filterMap: filterable.Filterable1<URI>['filterMap'] = (fa, f) => pipe(fa, filterMap(f))
const _partition: filterable.Filterable1<URI>['partition'] = <A>(fa: Stream<A>, predicate: predicate.Predicate<A>) =>
  pipe(fa, partition(predicate))
const _partitionMap: filterable.Filterable1<URI>['partitionMap'] = (fa, f) => pipe(fa, partitionMap(f))
const _partitionWithIndex: filterableWithIndex.FilterableWithIndex1<URI, number>['partitionWithIndex'] = <A>(
  fa: Stream<A>,
  predicateWithIndex: (i: number, a: A) => boolean
) => pipe(fa, partitionWithIndex(predicateWithIndex))
const _partitionMapWithIndex: filterableWithIndex.FilterableWithIndex1<URI, number>['partitionMapWithIndex'] = <
  A,
  B,
  C
>(
  fa: Stream<A>,
  f: (i: number, a: A) => either.Either<B, C>
) => pipe(fa, partitionMapWithIndex(f))
const _filterMapWithIndex: filterableWithIndex.FilterableWithIndex1<URI, number>['filterMapWithIndex'] = <A, B>(
  fa: Stream<A>,
  f: (i: number, a: A) => option.Option<B>
) => pipe(fa, filterMapWithIndex(f))
/* istanbul ignore next */
const _filterWithIndex: filterableWithIndex.FilterableWithIndex1<URI, number>['filterWithIndex'] = <A>(
  fa: Stream<A>,
  predicateWithIndex: (i: number, a: A) => boolean
) => pipe(fa, filterWithIndex(predicateWithIndex))
const _ap: apply.Apply1<URI>['ap'] = (fab, fa) =>
  pipe(
    fab,
    chain((f) => pipe(fa, map(f)))
  )
const _chain: chain_.Chain1<URI>['chain'] = (ma, f) => pipe(ma, chain(f))
const _alt: catAlt.Alt1<URI>['alt'] = (fa, that) => pipe(fa, alt(that))

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * Get a `Semigroup` based on sequential yields.
 * See also [`getMonoid`](#getMonoid).
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const S = stream.getSemigroup<number>();
 * const test =
 *  pipe(
 *   S.concat(stream.fromArray([1, 2]), stream.fromArray([2, 3])),
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, [1, 2, 2, 3])),
 *  )
 *
 * test()
 *
 * @category instances
 * @since 0.1.0
 */
export const getSemigroup = <A = never>(): semigroup.Semigroup<Stream<A>> => ({
  concat: (first, second) =>
    async function* () {
      yield* first()
      yield* second()
    }
})

/**
 * Returns a `Monoid` for `Stream<A>` based on sequential yields.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task, monoid } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const M = stream.getMonoid<number>();
 *
 * const test =
 *  pipe(
 *   monoid.concatAll(M)([stream.fromArray([1, 2]), stream.fromArray([2, 3])]),
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, [1, 2, 2, 3])),
 *  )
 *
 * test()
 *
 * @category instances
 * @since 0.1.0
 */
export const getMonoid = <A = never>(): monoid.Monoid<Stream<A>> => ({
  concat: getSemigroup<A>().concat,
  empty: zero()
})

/**
 * @category instances
 * @since 0.1.0
 */
export const Functor: functor.Functor1<URI> = {
  URI,
  map: _map
}

/**
 * Given an input an `Array` of functions, `flap` returns an `Array` containing
 * the results of applying each function to the given input.
 *
 * @example
 * import { pipe } from 'fp-ts/function'
 * import { task } from 'fp-ts'
 * import { stream } from 'fp-async-generator-streams'
 *
 * const funs = stream.fromArray([
 *   (n: number) => `Double: ${n * 2}`,
 *   (n: number) => `Triple: ${n * 3}`,
 *   (n: number) => `Square: ${n * n}`,
 * ])
 *
 * const test =
 *  pipe(
 *   stream.flap(4)(funs),
 *   stream.toArray,
 *   task.map(res => assert.deepStrictEqual(res, ['Double: 8', 'Triple: 12', 'Square: 16'])),
 *  )
 *
 * test()
 *
 * @category mapping
 * @since 0.1.0
 */
export const flap = /*#__PURE__*/ functor.flap(Functor)

/**
 * @category instances
 * @since 0.1.0
 */
export const Pointed: pointed.Pointed1<URI> = {
  URI,
  of
}

/**
 * @category instances
 * @since 0.1.0
 */
export const FunctorWithIndex: functorWithIndex.FunctorWithIndex1<URI, number> = {
  URI,
  map: _map,
  mapWithIndex: _mapWithIndex
}

/**
 * @category instances
 * @since 0.1.0
 */
export const Apply: apply.Apply1<URI> = {
  URI,
  map: _map,
  ap: _ap
}

/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @since 0.1.0
 */
export const apFirst = /*#__PURE__*/ apply.apFirst(Apply)

/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @since 0.1.0
 */
export const apSecond = /*#__PURE__*/ apply.apSecond(Apply)

/**
 * @category instances
 * @since 0.1.0
 */
export const Applicative: applicative.Applicative1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of
}

/**
 * @category instances
 * @since 0.1.0
 */
export const Chain: chain_.Chain1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain
}

/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @example
 * import { stream } from 'fp-async-generator-streams'
 * import { task } from 'fp-ts'
 * import { pipe } from 'fp-ts/function'
 *
 * const test1 =
 *  pipe(
 *    stream.fromArray([1, 2, 3]),
 *    stream.chainFirst(() => stream.fromArray(['a', 'b'])),
 *    stream.toArray,
 *    task.map(res => assert.deepStrictEqual(res, [1, 1, 2, 2, 3, 3])),
 *  )
 *
 * test1()
 *
 * const test2 =
 *  pipe(
 *    stream.fromArray([1, 2, 3]),
 *    stream.chainFirst(() => stream.fromArray([])),
 *    stream.toArray,
 *    task.map(res => assert.deepStrictEqual(res, [])),
 *  )
 *
 * test2()
 *
 * @category sequencing
 * @since 0.1.0
 */
export const chainFirst: <A, B>(f: (a: A) => Stream<B>) => (first: Stream<A>) => Stream<A> =
  /*#__PURE__*/ chain_.chainFirst(Chain)

/**
 * @category instances
 * @since 0.1.0
 */
export const Monad: monad.Monad1<URI> = {
  URI,
  map: _map,
  of,
  ap: _ap,
  chain: _chain
}

/**
 * @category instances
 * @since 0.1.0
 */
export const Unfoldable: unfoldable.Unfoldable1<URI> = {
  URI,
  unfold
}

/**
 * @category instances
 * @since 0.1.0
 */
export const Alt: catAlt.Alt1<URI> = {
  URI,
  map: _map,
  alt: _alt
}

/**
 * @category instances
 * @since 0.1.0
 */
export const Zero: catZero.Zero1<URI> = {
  URI,
  zero
}

/**
 * @category do notation
 * @since 0.1.0
 */
export const guard = /*#__PURE__*/ catZero.guard(Zero, Pointed)

/**
 * @category instances
 * @since 0.1.0
 */
export const Alternative: alternative.Alternative1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  alt: _alt,
  zero
}

/**
 * @category instances
 * @since 0.1.0
 */
export const Compactable: compactable.Compactable1<URI> = {
  URI,
  compact,
  separate
}

/**
 * @category instances
 * @since 0.1.0
 */
export const Filterable: filterable.Filterable1<URI> = {
  URI,
  map: _map,
  compact,
  separate,
  filter: _filter,
  filterMap: _filterMap,
  partition: _partition,
  partitionMap: _partitionMap
}

/**
 * @category instances
 * @since 0.1.0
 */
export const FilterableWithIndex: filterableWithIndex.FilterableWithIndex1<URI, number> = {
  URI,
  map: _map,
  mapWithIndex: _mapWithIndex,
  compact,
  separate,
  filter: _filter,
  filterMap: _filterMap,
  partition: _partition,
  partitionMap: _partitionMap,
  partitionMapWithIndex: _partitionMapWithIndex,
  partitionWithIndex: _partitionWithIndex,
  filterMapWithIndex: _filterMapWithIndex,
  filterWithIndex: _filterWithIndex
}

/**
 * @category instances
 * @since 2.11.0
 */
export const FromEither: fromEither_.FromEither1<URI> = {
  URI,
  fromEither
}

/**
 * @category lifting
 * @since 2.11.0
 */
export const fromEitherK: <E, A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => either.Either<E, B>
) => (...a: A) => Stream<B> = /*#__PURE__*/ fromEither_.fromEitherK(FromEither)

/**
 * @category instances
 * @since 2.11.0
 */
export const FromTask: fromTask_.FromTask1<URI> = {
  URI,
  fromTask,
  fromIO
}

/**
 * @category lifting
 * @since 2.10.0
 */
export const fromTaskK: <A extends ReadonlyArray<unknown>, B>(f: (...a: A) => task.Task<B>) => (...a: A) => Stream<B> =
  /*#__PURE__*/ fromTask_.fromTaskK(FromTask)

/**
 * @category sequencing
 * @since 2.10.0
 */
export const chainTaskK: <A, B>(f: (a: A) => task.Task<B>) => (first: Stream<A>) => Stream<B> =
  /*#__PURE__*/ fromTask_.chainTaskK(FromTask, Chain)

/**
 * @category sequencing
 * @since 2.10.0
 */
export const chainFirstTaskK: <A, B>(f: (a: A) => task.Task<B>) => (first: Stream<A>) => Stream<A> =
  /*#__PURE__*/ fromTask_.chainFirstTaskK(FromTask, Chain)

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @category do notation
 * @since 0.1.0
 */
export const Do: Stream<{}> = /*#__PURE__*/ of({})

/**
 * @category do notation
 * @since 0.1.0
 */
export const bindTo = /*#__PURE__*/ functor.bindTo(Functor)

const let_ = /*#__PURE__*/ functor.let(Functor)

export {
  /**
   * @category do notation
   * @since 0.1.0
   */
  let_ as let
}

/**
 * @category do notation
 * @since 0.1.0
 */
export const bind = chain_.bind(Chain)

/**
 * @category do notation
 * @since 0.1.0
 */
export const apS = /*#__PURE__*/ apply.apS(Apply)
