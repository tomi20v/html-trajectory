export default function cannonBall(
  flyingId: string,
  targetId: string,
  options: {
    moveX?: boolean,
    moveY?: boolean,
    duration?: number,
    acceleration?: number, // in m/s^2
    scale?: number,
    fly3D?: boolean,
    onTransitionEnd?: () => void,
    removeOriginal?: boolean,
  } = {}
  ) {
  const {
    moveX = true,
    moveY = true,
    duration = 1.2,
    acceleration = 9.81,
    scale = 1,
    fly3D = false,
    onTransitionEnd = () => {},
    removeOriginal = true,
  } = options;

  const flyingEl = document.getElementById(flyingId);
  if (!flyingEl) return;

  const targetEl = document.getElementById(targetId);
  if (!targetEl) return;

  const flyingRect = flyingEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();
  const deltaX = (targetRect.left + targetRect.right) / 2 - (flyingRect.left + flyingRect.right) / 2;
  const deltaY = (targetRect.top + targetRect.bottom) / 2 - (flyingRect.top + flyingRect.bottom) / 2;

  const wrapper = document.createElement('div');
  Object.assign(wrapper.style, {
    position: 'absolute',
    top: `${flyingRect.top}px`,
    left: `${flyingRect.left}px`,
    width: `${flyingRect.width}px`,
    height: `${flyingRect.height}px`,
    zIndex: '99',
    overflow: 'visible',
    pointerEvents: 'none',
  });

  const clone = flyingEl.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '100%',
    height: '100%',
    transform: 'none',
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);
  wrapper.getBoundingClientRect();
  
  // Remove the original element if removeOriginal is true
  if (removeOriginal) {
    flyingEl.remove();
  }

  const effectiveAcceleration = fly3D ? 0 : acceleration;
  const accelerationPx = effectiveAcceleration * 100; // convert m/s² to px/s²

  if (moveX) {
    wrapper.style.transform = `translateX(${deltaX}px)`;
    wrapper.style.transition = `transform ${duration}s linear`;
  }

  if (moveY) {
    const s = deltaY;
    const v0 = accelerationPx === 0 ? s / duration : (s - 0.5 * accelerationPx * duration * duration) / duration;

    let startTime: number | null = null;

    function animateY(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      if (elapsed >= duration) {
        clone.style.transform = `translateY(${deltaY}px) scale(${scale})`;
        // Make sure this callback is definitely executed
        try {
          onTransitionEnd();
        } catch (e) {
          console.error("Error in onTransitionEnd callback", e);
        }
        wrapper.remove();
        if (removeOriginal) {
          flyingEl?.remove();
        }
        return;
      }

      const displacement = accelerationPx === 0
        ? v0 * elapsed
        : v0 * elapsed + 0.5 * accelerationPx * elapsed * elapsed;

      const progress = elapsed / duration;
      let currentScale = 1;
      if (progress > 0.66) {
        const t = (progress - 0.66) / 0.34;
        currentScale = 1 + (scale - 1) * t;
      }

      clone.style.transform = `translateY(${displacement}px) scale(${currentScale})`;
      requestAnimationFrame(animateY);
    }

    requestAnimationFrame(animateY);
  }

  if (!moveY) {
    clone.style.transform = `none`;
  }

  if (!moveX && !moveY) {
    setTimeout(() => {
      onTransitionEnd();
      wrapper.remove();
      if (removeOriginal) {
        flyingEl.remove();
      }
    }, duration * 1000);
  } else if (!moveX && moveY) {
    // handled by animateY
  } else if (moveX && !moveY) {
    wrapper.addEventListener('transitionend', () => {
      onTransitionEnd();
      wrapper.remove();
      if (removeOriginal) {
        flyingEl.remove();
      }
    }, { once: true });
  }
}
