# Iterables

Basic functions that can be used to manipulate and utilise iterables

### `drain`

<details>
    <summary>Standard function</summary>
    
    import { drain } from "@opennetwork/iterable";
    
    // Iterable<number>
    const iterable = [1, 2, 3];
    // boolean
    const result = drain(iterable);
    console.log("Had any value", result);
</details>

<details>
    <summary>Async function</summary>
    
    import { asyncDrain } from "@opennetwork/iterable";
    
    // AsyncIterableLike<number>
    const iterable = [1, 2, 3];
    
    (async () => {
        const result: boolean = await asyncDrain(iterable);
        console.log("Had any value", result);
    })();
</details>

<details>
    <summary>Standard extended iterable</summary>
    
    import { extendedIterable } from "@opennetwork/iterable";
    
    // Iterable<number>
    const iterable = [1, 2, 3];
    // boolean
    const result = extendedIterable(iterable).drain();
    console.log("Had any value", result);
</details>

<details>
    <summary>Async extended iterable</summary>
    
    import { asyncExtendedIterable } from "@opennetwork/iterable";
    
    // AsyncIterableLike<number>
    const iterable = [1, 2, 3];
    
    (async () => {
        // boolean 
        const result = await asyncExtendedIterable(iterable).drain();
        console.log("Had any value", result);
    })();
    
</details>

### `every`

<details>
    <summary>Standard function</summary>
    
    import { every } from "@opennetwork/iterable";
    
    // Iterable<number>
    const iterable = [1, 2, 3];
    // boolean
    const result = every(iterable, value => value > 0);
    console.log("Every over 0", result);
</details>

<details>
    <summary>Async function</summary>
    
    import { asyncDrain } from "@opennetwork/iterable";
    
    // AsyncIterableLike<number>
    const iterable = [1, 2, 3];
    
    (async () => {
        const result: boolean = await asyncEvery(iterable, value => Promise.resolve(value > 0));
        console.log("Every over 0", result);
    })();
</details>

<details>
    <summary>Standard extended iterable</summary>
    
    import { extendedIterable } from "@opennetwork/iterable";
    
    // Iterable<number>
    const iterable = [1, 2, 3];
    // boolean
    const result = extendedIterable(iterable).every(value => value > 0);
    console.log("Every over 0", result);
</details>

<details>
    <summary>Async extended iterable</summary>
    
    import { asyncExtendedIterable } from "@opennetwork/iterable";
    
    // AsyncIterableLike<number>
    const iterable = [1, 2, 3];
    
    (async () => {
        // boolean 
        const result = await asyncExtendedIterable(iterable).every(value => Promsie.resolve(value > 0));
        console.log("Every over 0", result);
    })();
    
</details>

### `except`

<details>
    <summary>Standard function</summary>
    
    import { except, toArray } from "@opennetwork/iterable";
    
    // Iterable<number>
    const iterable = [1, 2, 3];
    // boolean
    const result = toArray(except(iterable, value => value > 2));
    console.log("Except over 2", result);
</details>

<details>
    <summary>Async function</summary>
    
    import { asyncExcept, asyncToArray } from "@opennetwork/iterable";
    
    // AsyncIterableLike<number>
    const iterable = [1, 2, 3];
    
    (async () => {
        const result: boolean = await asyncToArray(asyncExcept(iterable, value => Promise.resolve(value > 2)));
        console.log("Except over 2", result);
    })();
</details>

<details>
    <summary>Standard extended iterable</summary>
    
    import { extendedIterable } from "@opennetwork/iterable";
    
    // Iterable<number>
    const iterable = [1, 2, 3];
    // boolean
    const result = extendedIterable(iterable).except(value => value > 2).toArray();
    console.log("Except over 2", result);
</details>

<details>
    <summary>Async extended iterable</summary>
    
    import { asyncExtendedIterable } from "@opennetwork/iterable";
    
    // AsyncIterableLike<number>
    const iterable = [1, 2, 3];
    
    (async () => {
        // ExtendedAsyncIterable 
        const result = await asyncExtendedIterable(iterable).except(value => Promsie.resolve(value > 2)).toArray();
        console.log("Except over 2", result);
    })();
    
</details>

### `filter`

<details>
    <summary>Standard function</summary>
    
    import { filter, toArray } from "@opennetwork/iterable";
    
    // Iterable<number>
    const iterable = [1, 2, 3];
    // boolean
    const result = toArray(filter(iterable, value => value > 2));
    console.log("Over 2", result);
</details>

<details>
    <summary>Async function</summary>
    
    import { asyncFilter, asyncToArray } from "@opennetwork/iterable";
    
    // AsyncIterableLike<number>
    const iterable = [1, 2, 3];
    
    (async () => {
        const result: boolean = await asyncToArray(asyncFilter(iterable, value => Promise.resolve(value > 2)));
        console.log("Over 2", result);
    })();
</details>

<details>
    <summary>Standard extended iterable</summary>
    
    import { extendedIterable } from "@opennetwork/iterable";
    
    // Iterable<number>
    const iterable = [1, 2, 3];
    // boolean
    const result = extendedIterable(iterable).filter(value => value > 2).toArray();
    console.log("Over 2", result);
</details>

<details>
    <summary>Async extended iterable</summary>
    
    import { asyncExtendedIterable } from "@opennetwork/iterable";
    
    // AsyncIterableLike<number>
    const iterable = [1, 2, 3];
    
    (async () => {
        // ExtendedAsyncIterable 
        const result = await asyncExtendedIterable(iterable).filter(value => Promsie.resolve(value > 2)).toArray();
        console.log("Over 2", result);
    })();
    
</details>

### `forEach`

### `hasAny`

### `map`

### `reduce`

### `retain`

### `some`

<details>
    <summary>Standard function</summary>
    
    import { some, toArray } from "@opennetwork/iterable";
    
    // Iterable<number>
    const iterable = [1, 2, 3];
    // boolean
    const result = toArray(some(iterable, value => value > 2));
    console.log("Any over 2", result);
</details>

<details>
    <summary>Async function</summary>
    
    import { asyncSome, asyncToArray } from "@opennetwork/iterable";
    
    // AsyncIterableLike<number>
    const iterable = [1, 2, 3];
    
    (async () => {
        const result: boolean = await asyncToArray(asyncSome(iterable, value => Promise.resolve(value > 2)));
        console.log("Any over 2", result);
    })();
</details>

<details>
    <summary>Standard extended iterable</summary>
    
    import { extendedIterable } from "@opennetwork/iterable";
    
    // Iterable<number>
    const iterable = [1, 2, 3];
    // boolean
    const result = extendedIterable(iterable).some(value => value > 2).toArray();
    console.log("Any over 2", result);
</details>

<details>
    <summary>Async extended iterable</summary>
    
    import { asyncExtendedIterable } from "@opennetwork/iterable";
    
    // AsyncIterableLike<number>
    const iterable = [1, 2, 3];
    
    (async () => {
        // ExtendedAsyncIterable 
        const result = await asyncExtendedIterable(iterable).some(value => Promsie.resolve(value > 2)).toArray();
        console.log("Any over 2", result);
    })();
    
</details>

### `union`

