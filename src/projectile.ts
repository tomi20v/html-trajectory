export default function projectile(
  flyingId: string,
  targetId: string,
  options?: {
    moveX?: boolean;
    moveY?: boolean;
    duration?: number;
    acceleration?: number;
    scale?: number;
    onTransitionEnd?: () => void;
    removeOriginal?: boolean;
    resetTransformation?: boolean;
    cloneStyles?: Partial<CSSStyleDeclaration> | Record<string, string>;
  }
) {
  const flying = document.getElementById(flyingId) as HTMLElement | null;
  const target = document.getElementById(targetId) as HTMLElement | null;

  // Try to get the field element first, fall back to document.body if not found
  const field = document.getElementById('field') as HTMLElement | null;
  const containerElement = field || document.body;

  if (!flying || !target) {
    throw 'Invalid IDs provided to projectile function';
  }

  const clone = flying.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.style.position = 'absolute';
  clone.style.pointerEvents = 'none';
  clone.style.margin = '0';
  // Reset transformation if option is enabled
  if (options?.resetTransformation) {
    clone.style.transform = 'none';
    clone.style.transformOrigin = 'center center';
  }
  // Apply custom clone styles if provided
  if (options?.cloneStyles) {
    Object.assign(clone.style, options.cloneStyles);
  }
  containerElement.appendChild(clone);

  const computedStyle = window.getComputedStyle(flying);
  const transform = computedStyle.transform;
  let baseRotation = 0;

  if (transform && transform !== 'none') {
    const matrixMatch = transform.match(/^matrix\(([-\d.,\s]+)\)$/);
    if (matrixMatch) {
      const values = matrixMatch[1].split(',').map(v => parseFloat(v.trim()));
      if (values.length >= 6) {
        const [a, b, c, d] = values;
        baseRotation = Math.atan2(b, a) * (180 / Math.PI);
      }
    }
  }

  clone.getBoundingClientRect();

  const flyingRect = flying.getBoundingClientRect();
  const containerRect = containerElement.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const startX = flyingRect.left - containerRect.left;
  const startY = flyingRect.top - containerRect.top;
  const endX = targetRect.left - containerRect.left + (targetRect.width - clone.offsetWidth) / 2;
  const endY = targetRect.top - containerRect.top + (targetRect.height - clone.offsetHeight) / 2;

  clone.style.left = `${startX}px`;
  clone.style.top = `${startY}px`;

  const duration = (options?.duration ?? 1) * 1000;
  const userAcceleration = options?.acceleration ?? 4;
  const acceleration = userAcceleration * 100;
  const moveX = options?.moveX ?? true;
  const moveY = options?.moveY ?? true;
  const targetScale = options?.scale ?? 1;
  const removeOriginal = options?.removeOriginal ?? true;

  if (removeOriginal) {
    flying.remove();
  }

  const distanceX = endX - startX;
  const distanceY = endY - startY;

  const velocityX = distanceX / (duration / 1000);
  const velocityYInitial = (distanceY - 0.5 * acceleration * Math.pow(duration / 1000, 2)) / (duration / 1000);

  let startTime: number | undefined;

  function animate(currentTime: number) {
    if (startTime === undefined) {
      startTime = currentTime;
    }
    const elapsed = (currentTime - startTime) / 1000; // in seconds
    const t = Math.min(elapsed, duration / 1000);

    const x = moveX ? startX + velocityX * t : startX;
    const y = moveY ? startY + velocityYInitial * t + 0.5 * acceleration * t * t : startY;

    const deltaT = 0.001;
    const nextT = Math.min(t + deltaT, duration / 1000);

    const nextX = moveX ? startX + velocityX * nextT : startX;
    const nextY = moveY ? startY + velocityYInitial * nextT + 0.5 * acceleration * nextT * nextT : startY;

    const dx = nextX - x;
    const dy = nextY - y;

    const angleRad = Math.atan2(dy, dx);
    const angleDeg = angleRad * (180 / Math.PI);

    const dynamicRotation = angleDeg + 90;
    const finalRotation = baseRotation + dynamicRotation;

    let scaleFactor = 1;
    if (t > (duration / 1000) * 0.66) {
      const progress = (t - (duration / 1000) * 0.66) / ((duration / 1000) * 0.34);
      scaleFactor = 1 + (targetScale - 1) * progress;
    }

    clone.style.transform = `rotate(${finalRotation}deg) scale(${scaleFactor})`;
    clone.style.left = `${x}px`;
    clone.style.top = `${y}px`;

    if (t < duration / 1000) {
      requestAnimationFrame(animate);
    } else {
      try {
        if (options?.onTransitionEnd) {
          options.onTransitionEnd();
        }
      } catch (e) {
        console.error("Error in onTransitionEnd callback", e);
      }
      clone.remove();
    }
  }

  requestAnimationFrame(animate);
}