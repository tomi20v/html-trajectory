export default function projectile(
  projectileId: string,
  targetId: string,
  options?: {
    moveX?: boolean;
    moveY?: boolean;
    duration?: number;
    acceleration?: number;
    scale?: number;
    removeOriginal?: boolean;
  }
) {
  const projectile = document.getElementById(projectileId) as HTMLElement | null;
  const target = document.getElementById(targetId) as HTMLElement | null;
  const field = document.getElementById('field') as HTMLElement | null;

  if (!projectile || !target || !field) {
    console.error('Invalid IDs provided to flyToTarget');
    return;
  }

  const clone = projectile.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.style.position = 'absolute';
  clone.style.pointerEvents = 'none';
  clone.style.margin = '0';
  field.appendChild(clone);

  const computedStyle = window.getComputedStyle(projectile);
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

  const projRect = projectile.getBoundingClientRect();
  const fieldRect = field.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const startX = projRect.left - fieldRect.left;
  const startY = projRect.top - fieldRect.top;
  const endX = targetRect.left - fieldRect.left + (targetRect.width - clone.offsetWidth) / 2;
  const endY = targetRect.top - fieldRect.top + (targetRect.height - clone.offsetHeight) / 2;

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
    projectile.remove();
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
      clone.remove();
    }
  }

  requestAnimationFrame(animate);
}

// Allow access from HTML onclick
(window as any).projectile = projectile;
