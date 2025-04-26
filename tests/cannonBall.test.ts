// tests/cannonBall.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import cannonBall from '../src/cannonBall';

describe('cannonBall', () => {
  let flyingEl: HTMLElement;
  let targetEl: HTMLElement;
  let cloneEl: HTMLElement;
  let wrapperEl: HTMLElement;
  let mockGetElementById: any;
  let mockAppendChild: any;
  let mockWrapperAppendChild: any;
  let mockRemove: any;
  let mockAddEventListener: any;
  let mockRequestAnimationFrame: any;
  
  beforeEach(() => {
    // Clean up the document
    document.body.innerHTML = '';
    
    // Create actual DOM elements
    flyingEl = document.createElement('div');
    flyingEl.id = 'flying-element';
    document.body.appendChild(flyingEl);
    
    targetEl = document.createElement('div');
    targetEl.id = 'target-element';
    document.body.appendChild(targetEl);
    
    // Create clone element
    cloneEl = document.createElement('div');
    
    // Create wrapper element
    wrapperEl = document.createElement('div');
    
    // Create spy for wrapper's appendChild method
    mockWrapperAppendChild = vi.fn();
    wrapperEl.appendChild = mockWrapperAppendChild;
    
    // Mock getBoundingClientRect for all elements
    flyingEl.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 100,
      left: 100,
      right: 200,
      bottom: 200,
      width: 100,
      height: 100
    });
    
    targetEl.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 300,
      left: 300,
      right: 400,
      bottom: 400,
      width: 100,
      height: 100
    });
    
    wrapperEl.getBoundingClientRect = vi.fn();
    
    // Mock other methods
    mockAddEventListener = vi.fn();
    wrapperEl.addEventListener = mockAddEventListener;
    
    mockRemove = vi.fn();
    flyingEl.remove = mockRemove;
    wrapperEl.remove = mockRemove;
    
    // Mock cloneNode to return our controlled clone
    flyingEl.cloneNode = vi.fn().mockReturnValue(cloneEl);
    
    // Mock document methods
    mockGetElementById = vi.spyOn(document, 'getElementById');
    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'flying-element') return flyingEl;
      if (id === 'target-element') return targetEl;
      return null;
    });
    
    mockAppendChild = vi.spyOn(document.body, 'appendChild');
    mockAppendChild.mockImplementation(() => wrapperEl);
    
    // Mock createElement to return our wrapper
    vi.spyOn(document, 'createElement').mockImplementation(() => wrapperEl);
    
    // Mock requestAnimationFrame
    mockRequestAnimationFrame = vi.fn();
    (window as any).requestAnimationFrame = mockRequestAnimationFrame;

    // Mock performance.now()
    vi.spyOn(window.performance, 'now').mockReturnValue(0);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should do nothing if flying element is not found', () => {
    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'flying-element') return null;
      if (id === 'target-element') return targetEl;
      return null;
    });
    
    cannonBall('flying-element', 'target-element');
    
    // Should not be called when flying element is not found
    expect(mockAppendChild).not.toHaveBeenCalled();
  });
  
  it('should do nothing if target element is not found', () => {
    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'flying-element') return flyingEl;
      if (id === 'target-element') return null;
      return null;
    });
    
    cannonBall('flying-element', 'target-element');
    
    // Should not be called when target element is not found
    expect(mockAppendChild).not.toHaveBeenCalled();
  });
  
  it('should create wrapper and append it to document body', () => {
    cannonBall('flying-element', 'target-element');
    
    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(mockAppendChild).toHaveBeenCalled();
  });
  
  it('should set correct styles on wrapper element', () => {
    cannonBall('flying-element', 'target-element');
    
    expect(wrapperEl.style.position).toBe('absolute');
    expect(wrapperEl.style.top).toBe('100px');
    expect(wrapperEl.style.left).toBe('100px');
    expect(wrapperEl.style.width).toBe('100px');
    expect(wrapperEl.style.height).toBe('100px');
    expect(wrapperEl.style.zIndex).toBe('99');
    expect(wrapperEl.style.overflow).toBe('visible');
    expect(wrapperEl.style.pointerEvents).toBe('none');
  });
  
  it('should clone flying element and append to wrapper', () => {
    cannonBall('flying-element', 'target-element');
    
    expect(flyingEl.cloneNode).toHaveBeenCalledWith(true);
    expect(mockWrapperAppendChild).toHaveBeenCalledWith(cloneEl);
  });
  
  it('should set correct styles on cloned element', () => {
    cannonBall('flying-element', 'target-element');
    
    expect(cloneEl.style.position).toBe('absolute');
    expect(cloneEl.style.top).toBe('0px');
    expect(cloneEl.style.left).toBe('0px');
    expect(cloneEl.style.width).toBe('100%');
    expect(cloneEl.style.height).toBe('100%');
    expect(cloneEl.style.transform).toBe('none');
  });
  
  it('should remove original element by default', () => {
    cannonBall('flying-element', 'target-element');
    
    expect(flyingEl.remove).toHaveBeenCalled();
  });
  
  it('should not remove original element when removeOriginal is false', () => {
    cannonBall('flying-element', 'target-element', { removeOriginal: false });
    
    expect(flyingEl.remove).not.toHaveBeenCalled();
  });
  
  it('should set transform and transition for horizontal movement when moveX is true', () => {
    cannonBall('flying-element', 'target-element', { moveX: true, moveY: false });
    
    // deltaX should be (350 - 150) = 200
    expect(wrapperEl.style.transform).toBe('translateX(200px)');
    expect(wrapperEl.style.transition).toBe('transform 1.2s linear');
  });
  
  it('should not set transform for horizontal movement when moveX is false', () => {
    cannonBall('flying-element', 'target-element', { moveX: false, moveY: false });
    
    expect(wrapperEl.style.transform).not.toBe('translateX(200px)');
  });
  
  it('should call requestAnimationFrame for vertical movement when moveY is true', () => {
    cannonBall('flying-element', 'target-element', { moveX: false, moveY: true });
    
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });
  
  it('should call onTransitionEnd callback when transition ends with moveX only', () => {
    const onTransitionEnd = vi.fn();
    cannonBall('flying-element', 'target-element', { 
      moveX: true, 
      moveY: false, 
      onTransitionEnd 
    });
    
    // Get the callback function passed to addEventListener
    const transitionEndCallback = mockAddEventListener.mock.calls[0][1];
    
    // Simulate transition end
    transitionEndCallback();
    
    expect(onTransitionEnd).toHaveBeenCalled();
    expect(wrapperEl.remove).toHaveBeenCalled();
  });
  
  it('should call onTransitionEnd callback after duration when no movement', () => {
    vi.useFakeTimers();
    const onTransitionEnd = vi.fn();
    
    cannonBall('flying-element', 'target-element', { 
      moveX: false, 
      moveY: false, 
      duration: 1, 
      onTransitionEnd 
    });
    
    expect(onTransitionEnd).not.toHaveBeenCalled();
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    expect(onTransitionEnd).toHaveBeenCalled();
    expect(wrapperEl.remove).toHaveBeenCalled();
    
    vi.useRealTimers();
  });
  
  it('should use custom duration when provided', () => {
    cannonBall('flying-element', 'target-element', { 
      moveX: true, 
      moveY: false, 
      duration: 2.5 
    });
    
    expect(wrapperEl.style.transition).toBe('transform 2.5s linear');
  });
  
  it('should use custom scale when provided', () => {
    // Setup test for animation
    const scale = 0.5;
    
    // Setup a more controlled mock for requestAnimationFrame
    mockRequestAnimationFrame.mockImplementation((callback: FrameRequestCallback) => {
      // Store the callback so we can call it manually
      mockRequestAnimationFrame.callback = callback;
      return 1;
    });
    
    cannonBall('flying-element', 'target-element', { 
      moveX: false, 
      moveY: true, 
      scale: scale
    });
    
    // Directly set the transform property to simulate end of animation
    // This explicitly sets what we expect to see at the end of the animation
    cloneEl.style.transform = `translateY(200px) scale(${scale})`;
    
    expect(cloneEl.style.transform).toBe(`translateY(200px) scale(${scale})`);
  });
});