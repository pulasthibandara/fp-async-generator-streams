---
title: stream.ts
nav_order: 2
parent: Modules
---

## stream overview

Added in v0.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [makeBy](#makeby)
  - [of](#of)
  - [replicate](#replicate)
  - [unfold](#unfold)
  - [zero](#zero)
- [conversions](#conversions)
  - [fromArray](#fromarray)
  - [fromEither](#fromeither)
  - [fromIO](#fromio)
  - [fromOption](#fromoption)
  - [fromRange](#fromrange)
  - [fromRec](#fromrec)
  - [fromTask](#fromtask)
- [do notation](#do-notation)
  - [Do](#do)
  - [apS](#aps)
  - [bind](#bind)
  - [bindTo](#bindto)
  - [guard](#guard)
  - [let](#let)
- [error handling](#error-handling)
  - [alt](#alt)
  - [altW](#altw)
- [filtering](#filtering)
  - [compact](#compact)
  - [filter](#filter)
  - [filterMap](#filtermap)
  - [filterMapWithIndex](#filtermapwithindex)
  - [filterWithIndex](#filterwithindex)
  - [partition](#partition)
  - [partitionMap](#partitionmap)
  - [partitionMapWithIndex](#partitionmapwithindex)
  - [partitionWithIndex](#partitionwithindex)
  - [separate](#separate)
- [instances](#instances)
  - [Alt](#alt)
  - [Alternative](#alternative)
  - [Applicative](#applicative)
  - [Apply](#apply)
  - [Chain](#chain)
  - [Compactable](#compactable)
  - [Filterable](#filterable)
  - [FilterableWithIndex](#filterablewithindex)
  - [FromEither](#fromeither)
  - [FromTask](#fromtask)
  - [Functor](#functor)
  - [FunctorWithIndex](#functorwithindex)
  - [Monad](#monad)
  - [Pointed](#pointed)
  - [URI](#uri)
  - [URI (type alias)](#uri-type-alias)
  - [Unfoldable](#unfoldable)
  - [Zero](#zero)
  - [getMonoid](#getmonoid)
  - [getSemigroup](#getsemigroup)
- [lifting](#lifting)
  - [fromArrayK](#fromarrayk)
  - [fromEitherK](#fromeitherk)
  - [fromPredicate](#frompredicate)
  - [fromTaskK](#fromtaskk)
- [mapping](#mapping)
  - [flap](#flap)
  - [map](#map)
  - [mapWithIndex](#mapwithindex)
- [model](#model)
  - [Stream (type alias)](#stream-type-alias)
- [sequencing](#sequencing)
  - [chain](#chain)
  - [chainFirst](#chainfirst)
  - [chainFirstTaskK](#chainfirsttaskk)
  - [chainTaskK](#chaintaskk)
  - [chainWithIndex](#chainwithindex)
  - [flatten](#flatten)
- [utils](#utils)
  - [Spanned (type alias)](#spanned-type-alias)
  - [apFirst](#apfirst)
  - [apSecond](#apsecond)
  - [append](#append)
  - [appendW](#appendw)
  - [broadcast](#broadcast)
  - [chunksOf](#chunksof)
  - [drop](#drop)
  - [dropWhile](#dropwhile)
  - [dropWhileIndex](#dropwhileindex)
  - [elem](#elem)
  - [execute](#execute)
  - [findFirst](#findfirst)
  - [findFirstMap](#findfirstmap)
  - [findFirstMapWithIndex](#findfirstmapwithindex)
  - [findIndex](#findindex)
  - [findLast](#findlast)
  - [findLastIndex](#findlastindex)
  - [findLastMap](#findlastmap)
  - [findLastMapWithIndex](#findlastmapwithindex)
  - [head](#head)
  - [init](#init)
  - [insertAt](#insertat)
  - [intersperse](#intersperse)
  - [isEmpty](#isempty)
  - [isNonEmpty](#isnonempty)
  - [last](#last)
  - [length](#length)
  - [lookup](#lookup)
  - [modifyAt](#modifyat)
  - [prepend](#prepend)
  - [prependAll](#prependall)
  - [prependW](#prependw)
  - [rotateLeft](#rotateleft)
  - [scan](#scan)
  - [spanLeft](#spanleft)
  - [splitAt](#splitat)
  - [take](#take)
  - [takeWhile](#takewhile)
  - [toArray](#toarray)
  - [uniq](#uniq)
  - [unzip](#unzip)
  - [updateAt](#updateat)
  - [zip](#zip)
  - [zipWith](#zipwith)

---

# constructors

## makeBy

Return a `Array` of length `n` with element `i` initialized with `f(i)`.

**Note**. `n` is normalized to a non negative integer.

**Signature**

```ts
export declare const makeBy: <A>(n: number, f: (i: number) => A) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const double = (i: number): number => i * 2

pipe(
  stream.makeBy(5, double),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, [0, 2, 4, 6, 8]))
)()

pipe(
  stream.makeBy(-3, double),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, []))
)()

pipe(
  stream.makeBy(4.32164, double),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, [0, 2, 4, 6]))
)()
```

Added in v0.1.0

## of

Makes an single element stream `Stream`, useful for building a [`Applicative`](#Applicative)

**Signature**

```ts
export declare const of: <A>(a: A) => Stream<A>
```

Added in v0.1.0

## replicate

Create a `Stream` containing a value repeated the specified number of times.

**Note**. `n` is normalized to a non negative integer.

**Signature**

```ts
export declare const replicate: <A>(n: number, a: A) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.replicate(3, 'a'),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, ['a', 'a', 'a']))
)()

pipe(
  stream.replicate(-3, 'a'),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, []))
)()

pipe(
  stream.replicate(2.985647, 'a'),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, ['a', 'a']))
)()
```

Added in v0.1.0

## unfold

`unfold` takes a function `f` which returns an `Option` of a tuple containing an outcome
value and an input for the following iteration.
`unfold` applies `f` to the initial value `b` and then recursively to the second
element of the tuple contained in the returned `option` of the previous
calculation until `f` returns `Option.none`.

**Signature**

```ts
export declare const unfold: <A, B>(b: B, f: (b: B) => option.Option<readonly [A, B]>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { option, task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const f = (n: number) => {
  if (n <= 0) return option.none
  const returnValue = n * 2
  const inputForNextRound = n - 1
  return option.some([returnValue, inputForNextRound] as const)
}

const test = pipe(
  stream.unfold(5, f),
  stream.toArray,
  task.map((unfolded) => assert.deepStrictEqual(unfolded, [10, 8, 6, 4, 2]))
)

test()
```

Added in v0.1.0

## zero

Makes an empty `Stream`, useful for building a [`Monoid`](#Monoid)

**Signature**

```ts
export declare const zero: <A>() => Stream<A>
```

Added in v0.1.0

# conversions

## fromArray

Create a stream from an `Array`.

**Signature**

```ts
export declare const fromArray: <A>(array: readonly A[]) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const test = pipe(
  ['a', 'b', 'c'],
  stream.fromArray,
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, ['a', 'b', 'c']))
)

test()
```

Added in v0.1.0

## fromEither

Create an stream from an `Either`. The resulting stream will contain the content of the
`Either` if it is `Right` and it will be empty if the `Either` is `Left`.

**Signature**

```ts
export declare const fromEither: <A>(fa: either.Either<unknown, A>) => Stream<A>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { either } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

pipe(
  either.right('r'),
  stream.fromEither,
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, ['r']))
)()

pipe(
  either.left('l'),
  stream.fromEither,
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, []))
)()
```

Added in v2.11.0

## fromIO

Create a stream of single element from the value of a IO.

**Signature**

```ts
export declare const fromIO: <A>(effect: io.IO<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { io, task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const test = pipe(
  stream.fromIO(io.of('abc')),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, ['abc']))
)

test()
```

Added in v0.1.0

## fromOption

Create an stream from an `Option`. The resulting stream will contain the content of the
`Option` if it is `Some` and it will be empty if the `Option` is `None`.

**Signature**

```ts
export declare const fromOption: <A>(fa: option.Option<A>) => Stream<A>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { option } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

pipe(
  option.some('a'),
  stream.fromOption,
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, ['a']))
)()

pipe(
  option.none,
  stream.fromOption,
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, []))
)()
```

Added in v2.11.0

## fromRange

Create a stream from a range of numbers.

**Signature**

```ts
export declare const fromRange: (start: number, end?: number) => Stream<number>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const test = pipe(
  stream.fromRange(0, 5),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [0, 1, 2, 3, 4]))
)

test()
```

Added in v0.1.0

## fromRec

Create a stream from a recursive function.

**Signature**

```ts
export declare const fromRec: <A>(
  fn: (a: option.Option<A>) => option.Option<A>
) => (init: option.Option<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const test = pipe(
  ['a', 'b', 'c'],
  stream.fromArray,
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, ['a', 'b', 'c']))
)

test()
```

Added in v0.1.0

## fromTask

Create a stream of single element from the value of a Task.

**Signature**

```ts
export declare const fromTask: <A>(task: task.Task<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const test = pipe(
  stream.fromTask(task.of('abc')),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, ['abc']))
)

test()
```

Added in v0.1.0

# do notation

## Do

**Signature**

```ts
export declare const Do: Stream<{}>
```

Added in v0.1.0

## apS

**Signature**

```ts
export declare const apS: <N, A, B>(
  name: Exclude<N, keyof A>,
  fb: Stream<B>
) => (fa: Stream<A>) => Stream<{ readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }>
```

Added in v0.1.0

## bind

**Signature**

```ts
export declare const bind: <N, A, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => Stream<B>
) => (ma: Stream<A>) => Stream<{ readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }>
```

Added in v0.1.0

## bindTo

**Signature**

```ts
export declare const bindTo: <N>(name: N) => <A>(fa: Stream<A>) => Stream<{ readonly [K in N]: A }>
```

Added in v0.1.0

## guard

**Signature**

```ts
export declare const guard: (b: boolean) => Stream<void>
```

Added in v0.1.0

## let

**Signature**

```ts
export declare const let: <N, A, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => B
) => (fa: Stream<A>) => Stream<{ readonly [K in N | keyof A]: K extends keyof A ? A[K] : B }>
```

Added in v0.1.0

# error handling

## alt

Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
types of kind `* -> *`.

In case of `Stream` concatenates the inputs into a single stream.

**Signature**

```ts
export declare const alt: <A>(that: Lazy<Stream<A>>) => (fa: Stream<A>) => Stream<A>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { task } from 'fp-ts'
import { pipe } from 'fp-ts/function'

const test = pipe(
  stream.fromArray([1, 2, 3]),
  stream.alt(() => stream.fromArray([4, 5])),
  stream.toArray,
  task.map((combined) => assert.deepStrictEqual(combined, [1, 2, 3, 4, 5]))
)

test()
```

Added in v0.1.0

## altW

Less strict version of [`alt`](#alt).

The `W` suffix (short for **W**idening) means that the return types will be merged.

**Signature**

```ts
export declare const altW: <B>(that: Lazy<Stream<B>>) => <A>(fa: Stream<A>) => Stream<B | A>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { task } from 'fp-ts'
import { pipe } from 'fp-ts/function'

const test = pipe(
  stream.fromArray([1, 2, 3]),
  stream.altW(() => stream.fromArray(['a', 'b'])),
  stream.toArray,
  task.map((combined) => assert.deepStrictEqual(combined, [1, 2, 3, 'a', 'b']))
)

test()
```

Added in v0.1.0

# filtering

## compact

Compact a stream of `Option`s discarding the `None` values and
keeping the `Some` values. It returns a new stream containing the values of
the `Some` options.

**Signature**

```ts
export declare const compact: <A>(fa: Stream<option.Option<A>>) => Stream<A>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { option, task } from 'fp-ts'
import { pipe } from 'fp-ts/function'

const test = pipe(
  stream.fromArray([option.some('a'), option.none, option.some('b')]),
  stream.compact,
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, ['a', 'b']))
)

test()
```

Added in v0.1.0

## filter

Given an iterating function that is a `Predicate` or a `Refinement`,
`filter` creates a new `stream` containing the elements of the original
`Stream` for which the iterating function is `true`.

**Signature**

```ts
export declare const filter: <A>(fn: predicate.Predicate<A>) => (s: Stream<A>) => Stream<A>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { isString } from 'fp-ts/lib/string'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

const test1 = pipe(
  ['a', 1, {}, 'b', 5],
  stream.fromArray,
  stream.filter(isString),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, ['a', 'b']))
)

test1()

const test2 = pipe(
  [-3, 1, -2, 5],
  stream.fromArray,
  stream.filter((x: number) => x > 0),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [1, 5]))
)

test2()
```

Added in v0.1.0

## filterMap

Maps a stream with an iterating function that returns an `Option`
and it keeps only the `Some` values discarding the `None`s.

**Signature**

```ts
export declare const filterMap: <A, B>(f: (a: A) => option.Option<B>) => (fa: Stream<A>) => Stream<B>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { pipe } from 'fp-ts/function'
import { option, task } from 'fp-ts'

const f = (s: string) => (s.length === 1 ? option.some(s.toUpperCase()) : option.none)

const test = pipe(
  ['a', 'no', 'neither', 'b'],
  stream.fromArray,
  stream.filterMap(f),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, ['A', 'B']))
)

test()
```

Added in v0.1.0

## filterMapWithIndex

Maps a stream with an iterating function that takes the index and the value of
each element and returns an `Option`. It keeps only the `Some` values discarding
the `None`s.

Same as [`filterMap`](#filterMap), but with an iterating function which takes also
the index as input.

**Signature**

```ts
export declare const filterMapWithIndex: <A, B>(
  f: (i: number, a: A) => option.Option<B>
) => (fa: Stream<A>) => Stream<B>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { pipe } from 'fp-ts/function'
import { option, task } from 'fp-ts'

const f = (i: number, s: string) => (i % 2 === 1 ? option.some(s.toUpperCase()) : option.none)

const test = pipe(
  ['a', 'no', 'neither', 'b'],
  stream.fromArray,
  stream.filterMapWithIndex(f),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, ['NO', 'B']))
)

test()
```

Added in v0.1.0

## filterWithIndex

Same as [`filter`](#filter), but passing also the index to the iterating function.

**Signature**

```ts
export declare const filterWithIndex: {
  <A, B extends A>(refinementWithIndex: filterableWithIndex.RefinementWithIndex<number, A, B>): (
    as: Stream<A>
  ) => Stream<B>
  <A>(predicateWithIndex: filterableWithIndex.PredicateWithIndex<number, A>): <B extends A>(bs: Stream<B>) => Stream<B>
  <A>(predicateWithIndex: filterableWithIndex.PredicateWithIndex<number, A>): (as: Stream<A>) => Stream<A>
}
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

const f = (index: number, x: number) => x > 0 && index <= 2

const test = pipe(
  [-3, 1, -2, 5],
  stream.fromArray,
  stream.filterWithIndex(f),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [1]))
)

test()
```

Added in v0.1.0

## partition

Given an iterating function that is a `Predicate` or a `Refinement`,
`partition` creates two new `Streams`s: `right` containing the elements of the original
`Stream` for which the iterating function is `true`, `left` containing the elements
for which it is false.

**Signature**

```ts
export declare const partition: {
  <A, B extends A>(refinement: refinement.Refinement<A, B>): (
    as: Stream<A>
  ) => separated.Separated<Stream<A>, Stream<B>>
  <A>(predicate: predicate.Predicate<A>): <B extends A>(bs: Stream<B>) => separated.Separated<Stream<B>, Stream<B>>
  <A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => separated.Separated<Stream<A>, Stream<A>>
}
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { separated, apply } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { isString } from 'fp-ts/lib/string'

pipe(
  ['a', 1, {}, 'b', 5],
  stream.fromArray,
  stream.partition(isString),
  separated.bimap(stream.toArray, stream.toArray),
  ({ left, right }) => ({ left, right }),
  apply.sequenceS(task.task),
  task.map((res) =>
    assert.deepStrictEqual(res, {
      left: [1, {}, 5],
      right: ['a', 'b'],
    })
  )
)()

pipe(
  [-3, 1, -2, 5],
  stream.fromArray,
  stream.partition((x: number) => x > 0),
  separated.bimap(stream.toArray, stream.toArray),
  ({ left, right }) => ({ left, right }),
  apply.sequenceS(task.task),
  task.map((res) =>
    assert.deepStrictEqual(res, {
      left: [-3, -2],
      right: [1, 5],
    })
  )
)()
```

Added in v0.1.0

## partitionMap

Given an iterating function that returns an `Either`,
`partitionMap` applies the iterating function to each element and it creates two `Streams`s:
`right` containing the values of `Right` results, `left` containing the values of `Left` results.

**Signature**

```ts
export declare const partitionMap: <A, B, C>(
  f: (a: A) => either.Either<B, C>
) => (fa: Stream<A>) => separated.Separated<Stream<B>, Stream<C>>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { separated, either, apply } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

const upperIfString = <B>(x: B): either.Either<B, string> =>
  typeof x === 'string' ? either.right(x.toUpperCase()) : either.left(x)

pipe(
  [-2, 'hello', 6, 7, 'world'],
  stream.fromArray,
  stream.partitionMap(upperIfString),
  separated.bimap(stream.toArray, stream.toArray),
  ({ left, right }) => ({ left, right }),
  apply.sequenceS(task.task),
  task.map((res) =>
    assert.deepStrictEqual(res, {
      left: [-2, 6, 7],
      right: ['HELLO', 'WORLD'],
    })
  )
)()
```

Added in v0.1.0

## partitionMapWithIndex

Same as [`partitionMap`](#partitionMap), but passing also the index to the iterating function.

**Signature**

```ts
export declare const partitionMapWithIndex: <A, B, C>(
  f: (i: number, a: A) => either.Either<B, C>
) => (fa: Stream<A>) => separated.Separated<Stream<B>, Stream<C>>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { separated, either, apply } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

const upperIfStringBefore3 = <B>(index: number, x: B): either.Either<B, string> =>
  index < 3 && typeof x === 'string' ? either.right(x.toUpperCase()) : either.left(x)

pipe(
  [-2, 'hello', 6, 7, 'world'],
  stream.fromArray,
  stream.partitionMapWithIndex(upperIfStringBefore3),
  separated.bimap(stream.toArray, stream.toArray),
  ({ left, right }) => ({ left, right }),
  apply.sequenceS(task.task),
  task.map((res) =>
    assert.deepStrictEqual(res, {
      left: [-2, 6, 7, 'world'],
      right: ['HELLO'],
    })
  )
)()
```

Added in v0.1.0

## partitionWithIndex

Same as [`partition`](#partition), but passing also the index to the iterating function.

**Signature**

```ts
export declare const partitionWithIndex: {
  <A, B extends A>(refinementWithIndex: filterableWithIndex.RefinementWithIndex<number, A, B>): (
    as: Stream<A>
  ) => separated.Separated<Stream<A>, Stream<B>>
  <A>(predicateWithIndex: filterableWithIndex.PredicateWithIndex<number, A>): <B extends A>(
    bs: Stream<B>
  ) => separated.Separated<Stream<B>, Stream<B>>
  <A>(predicateWithIndex: filterableWithIndex.PredicateWithIndex<number, A>): (
    as: Stream<A>
  ) => separated.Separated<Stream<A>, Stream<A>>
}
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { separated } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { task, apply } from 'fp-ts'

pipe(
  [-2, 5, 6, 7],
  stream.fromArray,
  stream.partitionWithIndex((index, x: number) => index < 3 && x > 0),
  separated.bimap(stream.toArray, stream.toArray),
  ({ left, right }) => ({ left, right }),
  apply.sequenceS(task.task),
  task.map((res) =>
    assert.deepStrictEqual(res, {
      left: [-2, 7],
      right: [5, 6],
    })
  )
)()
```

Added in v0.1.0

## separate

Separate a stream of `Either`s into `Left`s and `Right`s, creating two new streams:
one containing all the left values and one containing all the right values.

**Signature**

```ts
export declare const separate: <A, B>(fa: Stream<either.Either<A, B>>) => separated.Separated<Stream<A>, Stream<B>>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { either, separated, apply, task } from 'fp-ts'
import { pipe } from 'fp-ts/function'

const test = pipe(
  stream.fromArray([either.right('r1'), either.left('l1'), either.right('r2')]),
  stream.separate,
  separated.bimap(stream.toArray, stream.toArray),
  ({ left, right }) => ({ left, right }),
  apply.sequenceS(task.task),
  task.map((res) =>
    assert.deepStrictEqual(res, {
      left: ['l1'],
      right: ['r1', 'r2'],
    })
  )
)

test()
```

Added in v0.1.0

# instances

## Alt

**Signature**

```ts
export declare const Alt: catAlt.Alt1<'Stream'>
```

Added in v0.1.0

## Alternative

**Signature**

```ts
export declare const Alternative: alternative.Alternative1<'Stream'>
```

Added in v0.1.0

## Applicative

**Signature**

```ts
export declare const Applicative: applicative.Applicative1<'Stream'>
```

Added in v0.1.0

## Apply

**Signature**

```ts
export declare const Apply: apply.Apply1<'Stream'>
```

Added in v0.1.0

## Chain

**Signature**

```ts
export declare const Chain: chain_.Chain1<'Stream'>
```

Added in v0.1.0

## Compactable

**Signature**

```ts
export declare const Compactable: compactable.Compactable1<'Stream'>
```

Added in v0.1.0

## Filterable

**Signature**

```ts
export declare const Filterable: filterable.Filterable1<'Stream'>
```

Added in v0.1.0

## FilterableWithIndex

**Signature**

```ts
export declare const FilterableWithIndex: filterableWithIndex.FilterableWithIndex1<'Stream', number>
```

Added in v0.1.0

## FromEither

**Signature**

```ts
export declare const FromEither: fromEither_.FromEither1<'Stream'>
```

Added in v2.11.0

## FromTask

**Signature**

```ts
export declare const FromTask: fromTask_.FromTask1<'Stream'>
```

Added in v2.11.0

## Functor

**Signature**

```ts
export declare const Functor: functor.Functor1<'Stream'>
```

Added in v0.1.0

## FunctorWithIndex

**Signature**

```ts
export declare const FunctorWithIndex: functorWithIndex.FunctorWithIndex1<'Stream', number>
```

Added in v0.1.0

## Monad

**Signature**

```ts
export declare const Monad: monad.Monad1<'Stream'>
```

Added in v0.1.0

## Pointed

**Signature**

```ts
export declare const Pointed: pointed.Pointed1<'Stream'>
```

Added in v0.1.0

## URI

**Signature**

```ts
export declare const URI: 'Stream'
```

Added in v0.1.0

## URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

Added in v0.1.0

## Unfoldable

**Signature**

```ts
export declare const Unfoldable: unfoldable.Unfoldable1<'Stream'>
```

Added in v0.1.0

## Zero

**Signature**

```ts
export declare const Zero: catZero.Zero1<'Stream'>
```

Added in v0.1.0

## getMonoid

Returns a `Monoid` for `Stream<A>` based on sequential yields.

**Signature**

```ts
export declare const getMonoid: <A = never>() => monoid.Monoid<Stream<A>>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, monoid } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const M = stream.getMonoid<number>()

const test = pipe(
  monoid.concatAll(M)([stream.fromArray([1, 2]), stream.fromArray([2, 3])]),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [1, 2, 2, 3]))
)

test()
```

Added in v0.1.0

## getSemigroup

Get a `Semigroup` based on sequential yields.
See also [`getMonoid`](#getMonoid).

**Signature**

```ts
export declare const getSemigroup: <A = never>() => semigroup.Semigroup<Stream<A>>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const S = stream.getSemigroup<number>()
const test = pipe(
  S.concat(stream.fromArray([1, 2]), stream.fromArray([2, 3])),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [1, 2, 2, 3]))
)

test()
```

Added in v0.1.0

# lifting

## fromArrayK

**Signature**

```ts
export declare const fromArrayK: <A, B>(array: (a: A) => B[]) => (a: A) => Stream<B>
```

Added in v0.1.0

## fromEitherK

**Signature**

```ts
export declare const fromEitherK: <E, A extends readonly unknown[], B>(
  f: (...a: A) => either.Either<E, B>
) => (...a: A) => Stream<B>
```

Added in v2.11.0

## fromPredicate

Create a stream with one element, if the element satisfies the predicate, otherwise
it returns an empty stream.

**Signature**

```ts
export declare function fromPredicate<A, B extends A>(refinement: refinement.Refinement<A, B>): (a: A) => Stream<B>
export declare function fromPredicate<A>(predicate: predicate.Predicate<A>): <B extends A>(b: B) => Stream<B>
export declare function fromPredicate<A>(predicate: predicate.Predicate<A>): (a: A) => Stream<A>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { pipe } from 'fp-ts/function'
import { isString } from 'fp-ts/lib/string'
import { task } from 'fp-ts'

pipe(
  'a',
  stream.fromPredicate(isString),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, ['a']))
)()

pipe(
  7,
  stream.fromPredicate(isString),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, []))
)()

pipe(
  7,
  stream.fromPredicate((x) => x > 0),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [7]))
)()

pipe(
  -3,
  stream.fromPredicate((x) => x > 0),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, []))
)()
```

Added in v2.11.0

## fromTaskK

**Signature**

```ts
export declare const fromTaskK: <A extends readonly unknown[], B>(
  f: (...a: A) => task.Task<B>
) => (...a: A) => Stream<B>
```

Added in v2.10.0

# mapping

## flap

Given an input an `Array` of functions, `flap` returns an `Array` containing
the results of applying each function to the given input.

**Signature**

```ts
export declare const flap: <A>(a: A) => <B>(fab: Stream<(a: A) => B>) => Stream<B>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const funs = stream.fromArray([
  (n: number) => `Double: ${n * 2}`,
  (n: number) => `Triple: ${n * 3}`,
  (n: number) => `Square: ${n * n}`,
])

const test = pipe(
  stream.flap(4)(funs),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, ['Double: 8', 'Triple: 12', 'Square: 16']))
)

test()
```

Added in v0.1.0

## map

`map` can be used to turn functions `(a: A) => B` into functions `(fa: Stream<A>) => Stream<B>`.
In practice it applies the base function to each element of the stream and collects the
results in a new stream.

**Signature**

```ts
export declare const map: <A, B>(fn: (a: A) => B) => (gen: Stream<A>) => Stream<B>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const f = (n: number) => n * 2
const test = pipe(
  stream.fromArray([1, 2, 3]),
  stream.map(f),
  stream.toArray,
  task.map((mapped) => assert.deepStrictEqual(mapped, [2, 4, 6]))
)

test()
```

Added in v0.1.0

## mapWithIndex

Same as [`map`](#map), but the iterating function takes both the index and the value
of the element.

**Signature**

```ts
export declare const mapWithIndex: <A, B>(fn: (idx: number, a: A) => B) => (gen: Stream<A>) => Stream<B>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const f = (i: number, s: string) => `${s} - ${i}`
const test = pipe(
  stream.fromArray(['a', 'b', 'c']),
  stream.mapWithIndex(f),
  stream.toArray,
  task.map((mapped) => assert.deepStrictEqual(mapped, ['a - 0', 'b - 1', 'c - 2']))
)

test()
```

Added in v0.1.0

# model

## Stream (type alias)

A light-weight, lazy, async generator based stream implementation.

**Signature**

```ts
export type Stream<A> = () => AsyncGenerator<A, void, undefined>
```

Added in v0.1.0

# sequencing

## chain

Composes computations in sequence, using the return value of one computation to
determine the next computation.

In other words it takes a function `f` that produces a stream from a single element of
the base type `A` and returns a new function which applies `f` to each element of the
input stream (like [`map`](#map)) and, instead of returning a stream of streams, concatenates the
results into a single stream (like [`flatten`](#flatten)).

This is the `chain` component of the stream `Monad`.

**Signature**

```ts
export declare const chain: <A, B>(f: (a: A) => Stream<B>) => (as: Stream<A>) => Stream<B>
```

**Example**

```ts
import { task } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { stream } from 'fp-async-generator-streams'

const f = (n: number) => stream.replicate(n, `${n}`)
const test = pipe(
  stream.fromArray([1, 2, 3]),
  stream.chain(f),
  stream.toArray,
  task.map((chained) => assert.deepStrictEqual(chained, ['1', '2', '2', '3', '3', '3']))
)

test()
```

Added in v0.1.0

## chainFirst

Composes computations in sequence, using the return value of one computation to determine the next computation and
keeping only the result of the first.

**Signature**

```ts
export declare const chainFirst: <A, B>(f: (a: A) => Stream<B>) => (first: Stream<A>) => Stream<A>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { task } from 'fp-ts'
import { pipe } from 'fp-ts/function'

const test1 = pipe(
  stream.fromArray([1, 2, 3]),
  stream.chainFirst(() => stream.fromArray(['a', 'b'])),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [1, 1, 2, 2, 3, 3]))
)

test1()

const test2 = pipe(
  stream.fromArray([1, 2, 3]),
  stream.chainFirst(() => stream.fromArray([])),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, []))
)

test2()
```

Added in v0.1.0

## chainFirstTaskK

**Signature**

```ts
export declare const chainFirstTaskK: <A, B>(f: (a: A) => task.Task<B>) => (first: Stream<A>) => Stream<A>
```

Added in v2.10.0

## chainTaskK

**Signature**

```ts
export declare const chainTaskK: <A, B>(f: (a: A) => task.Task<B>) => (first: Stream<A>) => Stream<B>
```

Added in v2.10.0

## chainWithIndex

Same as [`chain`](#chain), but passing also the index to the iterating function.

**Signature**

```ts
export declare const chainWithIndex: <A, B>(f: (i: number, a: A) => Stream<B>) => (as: Stream<A>) => Stream<B>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

const f = (index: number, x: string) => stream.replicate(2, `${x}${index}`)
const test = pipe(
  stream.fromArray(['a', 'b', 'c']),
  stream.chainWithIndex(f),
  stream.toArray,
  task.map((chained) => assert.deepStrictEqual(chained, ['a0', 'a0', 'b1', 'b1', 'c2', 'c2']))
)

test()
```

Added in v0.1.0

## flatten

Takes an stream of streams of `A` and flattens them into an stream of `A`
by concatenating the elements of each stream in order.

**Signature**

```ts
export declare const flatten: <A>(mma: Stream<Stream<A>>) => Stream<A>
```

**Example**

```ts
import { task, array } from 'fp-ts'
import { pipe } from 'fp-ts/function'
import { stream } from 'fp-async-generator-streams'

pipe(
  [['a'], ['b', 'c'], ['d', 'e', 'f']],
  stream.fromArray,
  stream.map(stream.fromArray),
  stream.flatten,
  stream.toArray,
  task.map((flattened) => assert.deepStrictEqual(flattened, ['a', 'b', 'c', 'd', 'e', 'f']))
)()
```

Added in v0.1.0

# utils

## Spanned (type alias)

Type returned by [`spanLeft`](#spanLeft) composed of an `init` Stream and a `rest` Stream.

**Signature**

```ts
export type Spanned<I, R> = {
  init: Stream<I>
  rest: Stream<R>
}
```

Added in v2.10.0

## apFirst

Combine two effectful actions, keeping only the result of the first.

**Signature**

```ts
export declare const apFirst: <B>(second: Stream<B>) => <A>(first: Stream<A>) => Stream<A>
```

Added in v0.1.0

## apSecond

Combine two effectful actions, keeping only the result of the second.

**Signature**

```ts
export declare const apSecond: <B>(second: Stream<B>) => <A>(first: Stream<A>) => Stream<B>
```

Added in v0.1.0

## append

Append an element to the end of a `Stream`, creating a new `Stream`.

**Signature**

```ts
export declare const append: <A>(end: A) => (init: Stream<A>) => Stream<A>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

pipe(
  stream.fromArray([0, 1, 2, 3]),
  stream.append(4),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [0, 1, 2, 3, 4]))
)()
```

Added in v2.10.0

## appendW

Less strict version of [`append`](#append).

**Signature**

```ts
export declare const appendW: <A, B>(end: B) => (init: Stream<A>) => Stream<A | B>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

pipe(
  stream.fromArray([0, 1, 2, 3]),
  stream.appendW('four'),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [0, 1, 2, 3, 'four']))
)()
```

Added in v2.11.0

## broadcast

Broadcast the stream to another stream without consuming multiple times
from the source.

If one consumer is slower than the other, the slower consumer will

**Signature**

```ts
export declare const broadcast: <A>(as: Stream<A>) => [Stream<A>, Stream<A>]
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const [s1, s2] = pipe(stream.fromArray([1, 2, 3, 4, 5, 6]), stream.broadcast)

const test1 = pipe(
  s1,
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [1, 2, 3, 4, 5, 6]))
)

const test2 = pipe(
  s2,
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [1, 2, 3, 4, 5, 6]))
)

pipe(task.sequenceArray([test1, test2]))()
```

Added in v0.1.0

## chunksOf

Splits a stream into length-`n` pieces. The last piece will be shorter if `n` does not evenly divide the length of
the stream. Note that `chunksOf(n)(stream.fromArray([]))` is `[]`, not `[[]]`. This is intentional, and is consistent with a recursive
definition of `chunksOf`; it satisfies the property that

```ts
chunksOf(n)(xs).concat(chunksOf(n)(ys)) == chunksOf(n)(xs.concat(ys)))
```

whenever `n` evenly divides the length of `xs`.

**Signature**

```ts
export declare const chunksOf: (chunkSize: number) => <T>(gen: Stream<T>) => Stream<T[]>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const test = pipe(
  stream.fromArray([1, 2, 3, 4, 5]),
  stream.chunksOf(2),
  stream.toArray,
  task.map((chunks) => assert.deepStrictEqual(chunks, [[1, 2], [3, 4], [5]]))
)

test()
```

Added in v0.1.0

## drop

Creates a new `Stream` which is a copy of the input dropping a max number of elements from the start.

**Note**. `n` is normalized to a non negative integer.

**Signature**

```ts
export declare const drop: (n: number) => <A>(as: Stream<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const stream1To3 = stream.fromRange(1, 4)

pipe(
  stream1To3,
  stream.drop(2),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [3]))
)()

pipe(
  stream1To3,
  stream.drop(5),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, []))
)()

pipe(
  stream1To3,
  stream.drop(0),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [1, 2, 3]))
)()

pipe(
  stream1To3,
  stream.drop(-2),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [1, 2, 3]))
)()
```

Added in v0.1.0

## dropWhile

Creates a new `Stream` which is a copy of the input dropping the longest initial substream for
which all element satisfy the specified predicate.

**Signature**

```ts
export declare function dropWhile<A, B extends A>(refinement: refinement.Refinement<A, B>): (as: Stream<A>) => Stream<B>
export declare function dropWhile<A>(predicate: predicate.Predicate<A>): <B extends A>(bs: Stream<B>) => Stream<B>
export declare function dropWhile<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  [1, 3, 2, 4, 5],
  stream.fromArray,
  stream.dropWhile((n: number) => n % 2 == 1),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [2, 4, 5]))
)()
```

Added in v0.1.0

## dropWhileIndex

Creates a new `Stream` which is a copy of the input dropping the longest initial substream for
which all element satisfy the specified predicate.

**Signature**

```ts
export declare function dropWhileIndex<A, B extends A>(
  refinement: filterableWithIndex.RefinementWithIndex<number, A, B>
): (as: Stream<A>) => Stream<B>
export declare function dropWhileIndex<A>(
  predicate: filterableWithIndex.PredicateWithIndex<number, A>
): <B extends A>(bs: Stream<B>) => Stream<B>
export declare function dropWhileIndex<A>(
  predicate: filterableWithIndex.PredicateWithIndex<number, A>
): (as: Stream<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  ['c', 'b', 'a', 'c', 'e'],
  stream.fromArray,
  stream.dropWhileIndex((idx: number, c: string) => c !== 'c' || idx < 3),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, ['c', 'e']))
)()
```

Added in v0.1.0

## elem

Test if a value is a member of an `Stream`. Takes a `Eq<A>` as a single
argument which returns the function to use to search for a value of type `A` in
an `Stream<A>`.

**Signature**

```ts
export declare const elem: <A>(E: eq.Eq<A>) => (a: A) => (as: Stream<A>) => task.Task<boolean>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, number } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 3]),
  stream.elem(number.Eq)(2),
  task.map((res) => assert.equal(true, res))
)()

pipe(
  stream.fromArray([1, 2, 3]),
  stream.elem(number.Eq)(0),
  task.map((res) => assert.equal(false, res))
)()
```

Added in v0.1.0

## execute

**Signature**

```ts
export declare const execute: <T, A>(fn: (agg: A, t: T) => A, init: A) => (stream: Stream<T>) => () => Promise<A>
```

## findFirst

Find the first element which satisfies a predicate (or a refinement) function

**Signature**

```ts
export declare function findFirst<A, B extends A>(
  refinement: refinement.Refinement<A, B>
): (as: Stream<A>) => taskOption.TaskOption<B>
export declare function findFirst<A>(
  predicate: predicate.Predicate<A>
): <B extends A>(bs: Stream<B>) => taskOption.TaskOption<B>
export declare function findFirst<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => taskOption.TaskOption<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

type X = {
  readonly a: number
  readonly b: number
}

const isA1 = (x: X) => x.a === 1

pipe(
  stream.fromArray([
    { a: 1, b: 1 },
    { a: 1, b: 2 },
  ]),
  stream.findFirst(isA1),
  task.map((res) => assert.deepStrictEqual(option.some({ a: 1, b: 1 }), res))
)()
```

Added in v0.1.0

## findFirstMap

Find the first element returned by an option based selector function

**Signature**

```ts
export declare const findFirstMap: <A, B>(f: (a: A) => option.Option<B>) => (as: Stream<A>) => taskOption.TaskOption<B>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

interface Person {
  readonly name: string
  readonly age?: number
}

const persons: stream.Stream<Person> = stream.fromArray([
  { name: 'John' },
  { name: 'Mary', age: 45 },
  { name: 'Joey', age: 28 },
])

pipe(
  persons,
  stream.findFirstMap((person) => (person.age ? option.some(person.age) : option.none)),
  task.map((res) => assert.deepStrictEqual(option.some(45), res))
)()
```

Added in v0.1.0

## findFirstMapWithIndex

Find the first index for which a predicate holds and return tuple of element and index

**Signature**

```ts
export declare const findFirstMapWithIndex: <A, B>(
  f: (i: number, a: A) => option.Option<B>
) => (as: Stream<A>) => task.Task<option.Option<B>>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 3, 2, 4]),
  stream.findFirstMapWithIndex((i, a) => (a === 2 ? option.some(`${i}-${a}`) : option.none)),
  task.map((res) => assert.deepStrictEqual(option.some('1-2'), res))
)()

pipe(
  stream.fromArray([]),
  stream.findFirstMapWithIndex((i, a) => (a === 2 ? option.some(`${i}-${a}`) : option.none)),
  task.map((res) => assert.deepStrictEqual(option.none, res))
)()
```

Added in v0.1.0

## findIndex

Find the first index for which a predicate holds

**Signature**

```ts
export declare const findIndex: <A>(
  predicate: predicate.Predicate<A>
) => (as: Stream<A>) => task.Task<option.Option<number>>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 3]),
  stream.findIndex((a) => a === 2),
  task.map((res) => assert.deepStrictEqual(option.some(1), res))
)()

pipe(
  stream.fromArray([]),
  stream.findIndex((a) => a === 2),
  task.map((res) => assert.deepStrictEqual(option.none, res))
)()
```

Added in v0.1.0

## findLast

Find the last element which satisfies a predicate function

**Signature**

```ts
export declare function findLast<A, B extends A>(
  refinement: refinement.Refinement<A, B>
): (as: Stream<A>) => taskOption.TaskOption<B>
export declare function findLast<A>(
  predicate: predicate.Predicate<A>
): <B extends A>(bs: Stream<B>) => taskOption.TaskOption<B>
export declare function findLast<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => taskOption.TaskOption<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([
    { a: 1, b: 1 },
    { a: 1, b: 2 },
  ]),
  stream.findLast((x) => x.a === 1),
  task.map((res) => assert.deepStrictEqual(option.some({ a: 1, b: 2 }), res))
)()
```

Added in v0.1.0

## findLastIndex

Find the last index for which a predicate holds

**Signature**

```ts
export declare const findLastIndex: <A>(
  predicate: predicate.Predicate<A>
) => (as: Stream<A>) => task.Task<option.Option<number>>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 3, 2, 4]),
  stream.findLastIndex((a) => a === 2),
  task.map((res) => assert.deepStrictEqual(option.some(3), res))
)()

pipe(
  stream.fromArray([]),
  stream.findLastIndex((a) => a === 2),
  task.map((res) => assert.deepStrictEqual(option.none, res))
)()
```

Added in v0.1.0

## findLastMap

Find the last element returned by an option based selector function

**Signature**

```ts
export declare const findLastMap: <A, B>(f: (a: A) => option.Option<B>) => (as: Stream<A>) => taskOption.TaskOption<B>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

interface Person {
  readonly name: string
  readonly age?: number
}

const persons: stream.Stream<Person> = stream.fromArray([
  { name: 'John' },
  { name: 'Mary', age: 45 },
  { name: 'Joey', age: 28 },
])

pipe(
  persons,
  stream.findLastMap((person) => (person.age ? option.some(person.age) : option.none)),
  task.map((res) => assert.deepStrictEqual(option.some(28), res))
)()
```

Added in v0.1.0

## findLastMapWithIndex

Find the last index for which a predicate holds and return tuple of element and index

**Signature**

```ts
export declare const findLastMapWithIndex: <A, B>(
  f: (i: number, a: A) => option.Option<B>
) => (as: Stream<A>) => task.Task<option.Option<B>>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 3, 2, 4]),
  stream.findLastMapWithIndex((i, a) => (a === 2 ? option.some(`${i}-${a}`) : option.none)),
  task.map((res) => assert.deepStrictEqual(option.some('3-2'), res))
)()

pipe(
  stream.fromArray([]),
  stream.findLastMapWithIndex((i, a) => (a === 2 ? option.some(`${i}-${a}`) : option.none)),
  task.map((res) => assert.deepStrictEqual(option.none, res))
)()
```

Added in v0.1.0

## head

Get the first element in an stream, or `None` if the stream is empty

**Signature**

```ts
export declare const head: <T>(stream: Stream<T>) => task.Task<option.Option<T>>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 3]),
  stream.head,
  task.map((res) => assert.deepStrictEqual(option.some(1), res))
)()

pipe(
  stream.fromArray([]),
  stream.head,
  task.map((res) => assert.deepStrictEqual(option.none, res))
)()
```

Added in v0.1.0

## init

Get all but the last element of an stream.
An empty stream is returned if the input stream contains one or less elements.

**Signature**

```ts
export declare const init: <A>(as: Stream<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 3]),
  stream.init,
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [1, 2]))
)()

pipe(
  stream.fromArray([]),
  stream.init,
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, []))
)()
```

Added in v0.1.0

## insertAt

Insert an element at the specified index, creating a new stream.
If the index is out of bounds, the original stream is returned.

**Signature**

```ts
export declare const insertAt: <A>(i: number, a: A) => (as: Stream<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 3, 4]),
  stream.insertAt(2, 5),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, [1, 2, 5, 3, 4]))
)()

pipe(
  stream.fromArray([1, 2, 3, 4]),
  stream.insertAt(4, 5),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, [1, 2, 3, 4, 5]))
)()
```

Added in v0.1.0

## intersperse

Creates a new `Stream` placing an element in between members of the input `Stream`.

**Signature**

```ts
export declare const intersperse: <A>(middle: A) => (as: Stream<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.intersperse(9)(stream.fromArray([1, 2, 3, 4])),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, [1, 9, 2, 9, 3, 9, 4]))
)()
```

Added in v0.1.0

## isEmpty

**Signature**

```ts
export declare const isEmpty: (stream: Stream<unknown>) => task.Task<boolean>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

pipe(
  stream.fromArray([1, 2, 3]),
  stream.isEmpty,
  task.map((res) => assert.deepStrictEqual(res, false))
)()

pipe(
  stream.fromArray([]),
  stream.isEmpty,
  task.map((res) => assert.deepStrictEqual(res, true))
)()
```

Added in v0.1.0

## isNonEmpty

**Signature**

```ts
export declare const isNonEmpty: (stream: Stream<unknown>) => task.Task<boolean>
```

## last

Get the last element in an stream, or `None` if the stream is empty

**Signature**

```ts
export declare const last: <T>(stream: Stream<T>) => task.Task<option.Option<T>>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 3]),
  stream.last,
  task.map((res) => assert.deepStrictEqual(option.some(3), res))
)()

pipe(
  stream.fromArray([]),
  stream.last,
  task.map((res) => assert.deepStrictEqual(option.none, res))
)()
```

Added in v0.1.0

## length

Get length of a stream.

**Signature**

```ts
export declare const length: <T>(stream: Stream<T>) => () => Promise<number>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 3]),
  stream.length,
  task.map((res) => assert.deepStrictEqual(3, res))
)()

pipe(
  stream.fromArray([]),
  stream.length,
  task.map((res) => assert.deepStrictEqual(0, res))
)()
```

Added in v0.1.0

## lookup

This function provides a safe way to read a value at a particular index from an stream.
It returns a `none` if the index is out of bounds, and a `some` of the element if the
index is valid.

**Signature**

```ts
export declare const lookup: (idx: number) => <A>(as: Stream<A>) => task.Task<option.Option<A>>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, option } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 3]),
  stream.lookup(1),
  task.map((res) => assert.deepStrictEqual(option.some(2), res))
)()

pipe(
  stream.fromArray([1, 2, 3]),
  stream.lookup(3),
  task.map((res) => assert.deepStrictEqual(option.none, res))
)()
```

Added in v0.1.0

## modifyAt

Apply a function to the element at the specified index, creating a new array,
or return the original array if the index is out of bounds.

**Signature**

```ts
export declare const modifyAt: <A>(i: number, f: (a: A) => A) => (as: Stream<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const double = (x: number): number => x * 2

pipe(
  stream.fromArray([1, 2, 3]),
  stream.modifyAt(1, double),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, [1, 4, 3]))
)()

pipe(
  stream.zero<number>(),
  stream.modifyAt(1, double),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, []))
)()
```

Added in v0.1.0

## prepend

Prepend an element to the front of a `Stream`, creating a new `Stream`.

**Signature**

```ts
export declare const prepend: <A>(head: A) => (tail: Stream<A>) => Stream<A>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

pipe(
  stream.fromArray([1, 2, 3, 4]),
  stream.prepend(0),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [0, 1, 2, 3, 4]))
)()
```

Added in v2.10.0

## prependAll

Creates a new `Stream`, prepending an element to every member of the input `Stream`.

**Signature**

```ts
export declare const prependAll: <A>(middle: A) => (as: Stream<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.prependAll(9)(stream.fromArray([1, 2, 3, 4])),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, [9, 1, 9, 2, 9, 3, 9, 4]))
)()
```

Added in v2.10.0

## prependW

Prepend an element to the front of a `Stream`, creating a new `Stream
Less strict version of [`prepend`](#prepend).

**Signature**

```ts
export declare const prependW: <B>(head: B) => <A>(tail: Stream<A>) => Stream<B | A>
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'

pipe(
  stream.fromArray([1, 2, 3, 4]),
  stream.prependW('zero'),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, ['zero', 1, 2, 3, 4]))
)()
```

## rotateLeft

Creates a new `Stream` rotating the input `Stream` by `n` steps.
`n` elements will get buffered in memory.

**Signature**

```ts
export declare const rotateLeft: (n: number) => <A>(as: Stream<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.rotateLeft(2)(stream.fromArray([1, 2, 3, 4, 5])),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, [3, 4, 5, 1, 2]))
)()
```

Added in v0.1.0

## scan

Same as `reduce` but it carries over the intermediate steps

**Signature**

```ts
export declare const scan: <A, B>(b: B, f: (b: B, a: A) => B) => (as: Stream<A>) => Stream<B>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 3]),
  stream.scan(10, (b, a: number) => b - a),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [10, 9, 7, 4]))
)()
```

Added in v2.0.0

## spanLeft

Split an stream into two parts:

1. the longest initial substream for which all elements satisfy the specified predicate
2. the remaining elements

**Signature**

```ts
export declare function spanLeft<A, B extends A>(
  refinement: refinement.Refinement<A, B>
): (as: Stream<A>) => Spanned<B, A>
export declare function spanLeft<A>(predicate: predicate.Predicate<A>): <B extends A>(bs: Stream<B>) => Spanned<B, B>
export declare function spanLeft<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => Spanned<A, A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, apply } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const isOdd = (n: number) => n % 2 === 1

pipe(
  [1, 3, 2, 4, 5],
  stream.fromArray,
  stream.spanLeft(isOdd),
  ({ init, rest }) => apply.sequenceS(task.task)({ init: stream.toArray(init), rest: stream.toArray(rest) }),
  task.map((res) => assert.deepStrictEqual(res, { init: [1, 3], rest: [2, 4, 5] }))
)()

pipe(
  [0, 2, 4, 5],
  stream.fromArray,
  stream.spanLeft(isOdd),
  ({ init, rest }) => apply.sequenceS(task.task)({ init: stream.toArray(init), rest: stream.toArray(rest) }),
  task.map((res) => assert.deepStrictEqual(res, { init: [], rest: [0, 2, 4, 5] }))
)()

pipe(
  [1, 3, 5],
  stream.fromArray,
  stream.spanLeft(isOdd),
  ({ init, rest }) => apply.sequenceS(task.task)({ init: stream.toArray(init), rest: stream.toArray(rest) }),
  task.map((res) => assert.deepStrictEqual(res, { init: [1, 3, 5], rest: [] }))
)()
```

Added in v0.1.0

## splitAt

Splits a `Stream` into two pieces, the first piece has max `n` elements.

**Signature**

```ts
export declare const splitAt: (n: number) => <A>(as: Stream<A>) => [Stream<A>, Stream<A>]
```

**Example**

```ts
import { stream } from 'fp-async-generator-streams'
import { pipe } from 'fp-ts/function'
import { task, array } from 'fp-ts'

pipe(
  stream.fromArray([1, 2, 3, 4, 5]),
  stream.splitAt(2),
  array.traverse(task.task)(stream.toArray),
  task.map((split) =>
    assert.deepStrictEqual(split, [
      [1, 2],
      [3, 4, 5],
    ])
  )
)()
```

Added in v0.1.0

## take

Keep only a max number of elements from the start of an `Stream`, creating a new `Stream`.

**Note**. `n` is normalized to a non negative integer.

**Signature**

```ts
export declare const take: (n: number) => <T>(gen: Stream<T>) => Stream<T>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

const stream1To5 = stream.fromRange(1, 6)

pipe(
  stream1To5,
  stream.take(2),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [1, 2]))
)()

pipe(
  stream1To5,
  stream.take(7),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [1, 2, 3, 4, 5]))
)()

pipe(
  stream1To5,
  stream.take(0),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, []))
)()

pipe(
  stream1To5,
  stream.take(-1),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, []))
)()
```

Added in v0.1.0

## takeWhile

Calculate the longest initial subarray for which all element satisfy the specified predicate, creating a new array

**Signature**

```ts
export declare function takeWhile<A, B extends A>(refinement: refinement.Refinement<A, B>): (as: Stream<A>) => Stream<B>
export declare function takeWhile<A>(predicate: predicate.Predicate<A>): <B extends A>(bs: Stream<B>) => Stream<B>
export declare function takeWhile<A>(predicate: predicate.Predicate<A>): (as: Stream<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  [2, 4, 3, 6],
  stream.fromArray,
  stream.takeWhile((n: number) => n % 2 == 0),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual(res, [2, 4]))
)()
```

Added in v0.1.0

## toArray

Convert a `Stream` to an `Array`

**Signature**

```ts
export declare const toArray: <T>(stream: Stream<T>) => () => Promise<T[]>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 3]),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual([1, 2, 3], res))
)()

pipe(
  stream.fromArray([]),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual([], res))
)()
```

Added in v0.1.0

## uniq

Creates a new `Stream` removing duplicate elements, keeping the first occurrence of an element,
based on a `Eq<A>`.

This is a naive implementation, which uses an array to store the encountered elements and has
a memory complexity of O(n) where n is the number of uniq elements in the `Stream`.

**Signature**

```ts
export declare const uniq: <A>(E: eq.Eq<A>) => (as: Stream<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, number } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 1]),
  stream.uniq(number.Eq),
  stream.toArray,
  task.map((res) => assert.deepStrictEqual([1, 2], res))
)()
```

Added in v0.1.0

## unzip

The function is reverse of `zip`. Takes an array of pairs and return two corresponding arrays.
This buffers the one output stream, if its slower than the other.

**Signature**

```ts
export declare const unzip: <A, B>(as: Stream<readonly [A, B]>) => readonly [Stream<A>, Stream<B>]
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task, apply } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.unzip(
    stream.fromArray([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ])
  ),
  ([a, b]) => [stream.toArray(a), stream.toArray(b)] as const,
  (t) => apply.sequenceT(task.ApplyPar)(...t),
  task.map(([arrayA, arrayB]) => {
    assert.deepStrictEqual(arrayA, [1, 2, 3])
    assert.deepStrictEqual(arrayB, ['a', 'b', 'c'])
  })
)()
```

Added in v0.1.0

## updateAt

Change the element at the specified index, creating a new stream.
If the index is out of bounds, the original stream is returned.

**Signature**

```ts
export declare const updateAt: <A>(i: number, a: A) => (as: Stream<A>) => Stream<A>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.fromArray([1, 2, 3]),
  stream.updateAt(1, 1),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, [1, 1, 3]))
)()

pipe(
  stream.zero<number>(),
  stream.updateAt(1, 1),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, []))
)()
```

Added in v0.1.0

## zip

Takes two streams and returns an stream of corresponding pairs. If one input stream is short, excess elements of the
longer stream are discarded

**Signature**

```ts
export declare function zip<B>(bs: Stream<B>): <A>(as: Stream<A>) => Stream<readonly [A, B]>
export declare function zip<A, B>(as: Stream<A>, bs: Stream<B>): Stream<readonly [A, B]>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.zip(stream.fromArray([1, 2, 3]), stream.fromArray(['a', 'b', 'c', 'd'])),
  stream.toArray,
  task.map((array) =>
    assert.deepStrictEqual(array, [
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ])
  )
)()
```

Added in v0.1.0

## zipWith

Apply a function to pairs of elements at the same index in two streams, collecting the results in a new stream. If one
input stream is short, excess elements of the longer stream are discarded.

**Signature**

```ts
export declare const zipWith: <A, B, C>(fa: Stream<A>, fb: Stream<B>, f: (a: A, b: B) => C) => Stream<C>
```

**Example**

```ts
import { pipe } from 'fp-ts/function'
import { task } from 'fp-ts'
import { stream } from 'fp-async-generator-streams'

pipe(
  stream.zipWith(stream.fromArray([1, 2, 3]), stream.fromArray(['a', 'b', 'c', 'd']), (a, b) => a + b),
  stream.toArray,
  task.map((array) => assert.deepStrictEqual(array, ['1a', '2b', '3c']))
)()
```

Added in v0.1.0
