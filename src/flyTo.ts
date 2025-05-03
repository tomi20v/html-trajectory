export default function flyTo(
  flyingId: string,
  targetId: string,
  options: {
    moveX?: boolean,
    moveY?: boolean
    duration?: number,
    scale?: number,
    onTransitionEnd?: () => void,
    removeOriginal?: boolean,
    resetTransformation?: boolean,
    cloneStyles?: Partial<CSSStyleDeclaration> | Record<string, string>,
  } = {}
) {
  const {
    moveX = true,
    moveY = true,
    duration = 0.4,
    scale = 0.1,
    onTransitionEnd = () => {},
    removeOriginal = true,
    resetTransformation = false,
    cloneStyles,
  } = options;

  const flyingEl = document.getElementById(flyingId);
  if (!flyingEl) return;

  const targetEl = document.getElementById(targetId);
  if (!targetEl) return;

  const flyingRect = flyingEl.getBoundingClientRect();
  const clone = flyingEl.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: 'absolute',
    top: flyingRect.top + 'px',
    left: flyingRect.left + 'px',
    width: flyingRect.width + 'px',
    height: flyingRect.height + 'px',
    zIndex: 99,
    opacity: 1,
    animation: 'none',
  });
  
  // Reset transformation if option is enabled
  if (resetTransformation) {
    clone.style.transform = 'none';
    clone.style.transformOrigin = 'center center';
  }
  // Apply custom clone styles if provided
  if (cloneStyles) {
    Object.assign(clone.style, cloneStyles);
  }
  
  document.body.appendChild(clone);
  
  clone.getBoundingClientRect();
  
  const targetRect = targetEl.getBoundingClientRect();
  const deltaX = (targetRect.left + targetRect.right) / 2 - (flyingRect.left + flyingRect.right) / 2;
  const deltaY = (targetRect.top + targetRect.bottom) / 2 - (flyingRect.top + flyingRect.bottom) / 2;
  
  const translateX = moveX ? `${deltaX}px` : '0px';
  const translateY = moveY ? `${deltaY}px` : '0px';
  
  // Set the animation transform - this will override any 'none' set earlier
  clone.style.transform = `translate(${translateX}, ${translateY}) scale(${scale})`;
  clone.style.transition = `transform ${duration*0.8 - 0.2}s ease, opacity ${duration}s ease`;

  // Remove the original element if removeOriginal is true
  if (removeOriginal) {
    flyingEl.remove();
  }

  let hasEnded = false;
  clone.addEventListener('transitionend', () => {
    if (hasEnded) return;
    hasEnded = true;
    try {
      onTransitionEnd();
    } catch (e) {}
    clone.remove();
  });
}
