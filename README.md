# html-trajectory

**html-trajectory** provides lightweight HTML animations to smoothly "fly" elements from their current position to a target element — for example, animating a product image flying into a shopping cart icon.  
It’s ideal for parabolic movement, curved animations, and element-to-element transitions.

---

## But why?

I had been using a simple **linear flyTo function** for some time in a project, based on basic CSS `transform` and `transition` to move (and scale) elements.

One day I wondered:
> Can two CSS animations with different easings be combined to create real curves?

The short answer:
- **No**, you cannot easily combine separate animations on the same element.
- **Yes**, you can create curves by wrapping the element inside a container and animating different properties separately.
- **But** — when trying to make the projectile follow the flight path tangent, I ran into complexity and limitations.

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

### flyTo(projectileId: string, targetId: string, options?: FlyOptions): void`

Animates an element flying in a **straight linear path** to the target.

- **`projectileId`** — ID of the element to fly (the moving projectile).
- **`targetId`** — ID of the target element (the destination).
- **`options`** *(optional)* — A configuration object:
  - **`duration`** — Animation duration in milliseconds (default is 400ms), @TODO PLANNED.
  - **`easing`** — CSS easing function for the animation (default is `"linear"`), @TODO PLANNED.
  - **`onTransitionEnd`** — Amount of delay before the animation starts, in milliseconds (default is `0`).

### Example

#### `cannonBall(projectileId: string, targetId: string, options?: FlyOptions): void`

Animates an element flying along a **parabolic arc** without rotating the element itself — similar to a cannonball.

#### `projectile(projectileId: string, targetId: string, options?: FlyOptions): void`

Animates an element along a **parabolic arc** with **rotation following the tangent** of the trajectory — like a flying rocket or arrow.

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