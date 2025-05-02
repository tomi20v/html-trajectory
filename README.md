# html-trajectory

**html-trajectory** provides lightweight HTML animations to smoothly "fly" elements from their current position to a target element — for example, animating a product image flying into a shopping cart icon.  
It’s ideal for parabolic movement, curved animations, and element-to-element transitions.

disclaimer: this project was happily vibe coded at it's "best" as an experiment. I used *any* LLM which did the job that moment.

---

## But why?

I had been using a simple **linear flyTo function** for some time in a project, based on basic CSS `transform` and `transition` to move (and scale) elements.

One day I wondered:
> Can two CSS animations with different easings be combined to create real curves?

The short answer:
- **No**, you cannot easily combine separate animations on the same element.
- **Yes**, you can create curves by wrapping the element inside a container and animating different properties separately.
- **But** — while simple curves are possible, there are limitations (still working on them :D)

So once I already had some basic functions working for linear and parabolic movements, I organized them into a small, reusable library.

---

## Installation

```sh
npm install --save html-trajectory
```

or with yarn:

```sh
yarn add html-trajectory
```

---

## Usage

```typescript
import { flyTo } from "html-trajectory";

// Example: Fly a product image into the cart icon
flyTo('product-image', 'cart-icon');
```

Example HTML:

```html
<img id="product-image" src="product.png">
<div id="cart-icon">🛒</div>
```

When calling `flyTo('product-image', 'cart-icon')`, the product image will fly straight into the cart icon.

---

## API

```
flyTo(flyingId: string, targetId: string, options?: FlyOptions): void
````

Animates an element flying in a **straight linear path** to the target.

- **`flyingId`** — ID of the element to fly (the moving projectile).
- **`targetId`** — ID of the target element (the destination).
- **`options`** *(optional)* — A configuration object:
  - **`moveX`** — Whether to move horizontally (default is `true`).
  - **`moveY`** — Whether to move vertically (default is `true`).
  - **`duration`** — Animation duration in seconds (default is `1`).
  - **`scale`** — Target scale factor at the end of animation (default is `1`).
  - **`onTransitionEnd`** — Callback function that executes when the animation completes (default is an empty function).
  - **`removeOriginal`** — Whether to remove the original element (default is `true`).
  - **`resetTransformation`** — When true, resets the clone's transform and transform-origin after cloning (default is `false`).

### Example

```
cannonBall(flyingId: string, targetId: string, options?: FlyOptions): void
```

Animates an element flying along a **parabolic arc** without rotating the element itself — similar to a cannonball.

- **`flyingId`** — ID of the element to fly (the moving projectile).
- **`targetId`** — ID of the target element (the destination).
- **`options`** *(optional)* — A configuration object:
  - **`moveX`** — Whether to move horizontally (default is `true`).
  - **`moveY`** — Whether to move vertically (default is `true`).
  - **`duration`** — Animation duration in seconds (default is `1`).
  - **`acceleration`** — Vertical acceleration in pixels/s² (default is `9.81`). Higher values create a steeper arc.
  - **`fly3D`** — When true, disables acceleration to create a straight-line path instead of a parabolic arc (default is `false`).
  - **`scale`** — Target scale factor at the end of animation (default is `1`).
  - **`onTransitionEnd`** — Callback function that executes when the animation completes (default is an empty function).
  - **`removeOriginal`** — Whether to remove the original element (default is `true`).
  - **`resetTransformation`** — When true, resets the clone's transform and transform-origin after cloning (default is `false`).

```
projectile(flyingId: string, targetId: string, options?: FlyOptions): void
```

Animates an element along a **parabolic arc** with **rotation following the tangent** of the trajectory — like a flying rocket or arrow.

- **`flyingId`** — ID of the element to fly (the moving projectile).
- **`targetId`** — ID of the target element (the destination).
- **`options`** *(optional)* — A configuration object:
  - **`moveX`** — Whether to move horizontally (default is `true`).
  - **`moveY`** — Whether to move vertically (default is `true`).
  - **`duration`** — Animation duration in seconds (default is `1`).
  - **`acceleration`** — Vertical acceleration in pixels/s² (default is `9.81`). Higher values create a steeper arc.
  - **`scale`** — Target scale factor at the end of animation (default is `1`).
  - **`onTransitionEnd`** — Callback function that executes when the animation completes (default is an empty function).
  - **`removeOriginal`** — Whether to remove the original element (default is `true`).
  - **`resetTransformation`** — When true, resets the clone's transform and transform-origin after cloning (default is `false`).

---

## Testing

The library uses [Vitest](https://vitest.dev/) for testing.

```sh
npm test
```

### Coverage

To check test coverage, run:

```sh
npm run coverage
```

Coverage output will appear in the `coverage/` folder.

---

## Dev Container

Use the provided `docker.sh` script to start a dev container with the project mounted.  
(Note: the script intentionally misses the executable bit.)

```sh
bash docker.sh
```

---

## License

MIT