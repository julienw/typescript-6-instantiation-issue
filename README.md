# TypeScript 6.0 regression: TS2589 on `implements` without type parameters

## Bug

TypeScript 6.0 reports `TS2589: Type instantiation is excessively deep and possibly infinite`
on a class that implements a generic interface without explicit type parameters, when the class
also has a property typed with a concrete instantiation of a generic type that appears in the
interface.

```ts
// TS2589 on the class declaration below in TypeScript 6.0.
// Fix: replace `WebComponentInterface` with `WebComponentInterface<RouteExt>`.
//
// Note: the error only triggers because `location` uses a concrete type parameter
// (`RouterLocation<RouteExt>`). Using `RouterLocation` without one does not trigger it.
export class MyElement extends HTMLElement implements WebComponentInterface {
  location?: RouterLocation<RouteExt>;
}
```

The fix is to provide explicit type parameters to the `implements` clause:

```ts
export class MyElement extends HTMLElement implements WebComponentInterface<RouteExt> {
  location?: RouterLocation<RouteExt>;
}
```

## Reproduction

```
npm install
npx tsc  # TS2589
```

## Versions

| TypeScript | Result        | Instantiations |
|------------|---------------|----------------|
| 5.9.3      | no error      | 2,593,860      |
| 6.0.2      | TS2589        | 5,379,836      |

TypeScript 6.0 performs ~2x more type instantiations for the same code, which pushes it over
the depth limit.

## Root cause

`WebComponentInterface<R, C>` (from `@vaadin/router`) contains deeply mutually-recursive
generic types: `RouterLocation<R, C>` → `Route<R, C>` → `RouteExtension<R, C>` →
`WebComponentInterface<R, C>` → …

When the `implements` clause has no explicit type parameters, TypeScript must infer `R` and `C`
by structurally matching the class's `location?: RouterLocation<RouteExt>` against the
interface's `location?: RouterLocation<R, C>`. Expanding this recursive type structure to
perform the match exceeds the instantiation depth limit in TypeScript 6.0.

Providing `<RouteExt>` explicitly avoids the inference and resolves the error.
