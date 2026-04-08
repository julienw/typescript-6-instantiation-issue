import type { RouterLocation, WebComponentInterface } from "@vaadin/router";

type RouteExt = { section?: string };

// TS2589 on the class declaration below.
// Fix: replace `WebComponentInterface` with `WebComponentInterface<RouteExt>`.
//
// Note: the error only triggers because `location` is typed with a concrete type
// parameter (`RouterLocation<RouteExt>`). Using `RouterLocation` without a type
// parameter does not trigger it.
export class MyElement extends HTMLElement implements WebComponentInterface {
  location?: RouterLocation<RouteExt>;
}
