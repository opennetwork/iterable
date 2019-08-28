# Iterables

Basic functions that can be used to manipulate and utilise iterables

### `drain`

<details>
    <summary>Standard function</summary>
    
    ```ts
    import { drain } from "@opennetwork/literal";
    
    const iterable: Iterable<number> = [1, 2, 3];
    const result: boolean = drain(iterable);
    console.log("Had any value", result);
    ```
</details>

<details>
    <summary>Async function</summary>
    
    ```ts
    import { asyncDrain, AsyncIterableLike } from "@opennetwork/literal";
    
    const iterable: AsyncIterableLike<number> = [1, 2, 3];
    
    (async () => {
        const result: boolean = await asyncDrain(iterable);
        console.log("Had any value", result);
    })();
    ```
</details>

<details>
    <summary>Standard extended iterable</summary>
    
    ```ts
    import { extendedIterable } from "@opennetwork/literal";
    
    const iterable: Iterable<number> = [1, 2, 3];
    const result: boolean = extendedIterable(iterable).drain();
    console.log("Had any value", result);
    ```
</details>

<details>
    <summary>Async extended iterable</summary>
    
    ```ts
    import { asyncExtendedIterable, AsyncIterableLike } from "@opennetwork/literal";
    
    const iterable: AsyncIterableLike<number> = [1, 2, 3];
    
    (async () => {
        const result: boolean = await asyncExtendedIterable(iterable).drain();
        console.log("Had any value", result);
    })();
    ```
</details>

### `every`

### `except`

### `filter`

### `forEach`

### `hasAny`

### `map`

### `reduce`

### `retain`

### `some`

### `union`

