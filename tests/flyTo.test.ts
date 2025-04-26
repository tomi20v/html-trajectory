// tests/flyTo.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import flyTo from '../src/flyTo';

describe('flyTo', () => {
  let flyingEl: HTMLElement;
  let targetEl: HTMLElement;
  let cloneEl: HTMLElement;
  let mockGetElementById: any;
  let mockAppendChild: any;
  let mockRemove: any;
  let mockAddEventListener: any;
  let mockGetBoundingClientRect: any;
  
  beforeEach(() => {
    // Clean up the document
    document.body.innerHTML = '';
    
    // Create actual DOM elements with happy-dom
    flyingEl = document.createElement('div');
    flyingEl.id = 'flying-element';
    document.body.appendChild(flyingEl);
    
    targetEl = document.createElement('div');
    targetEl.id = 'target-element';
    document.body.appendChild(targetEl);
    
    // Create clone element
    cloneEl = document.createElement('div');
    
    // Mock getBoundingClientRect for all elements
    mockGetBoundingClientRect = vi.fn();
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
    
    cloneEl.getBoundingClientRect = vi.fn();
    
    // Mock other methods
    mockAddEventListener = vi.fn();
    cloneEl.addEventListener = mockAddEventListener;
    
    mockRemove = vi.fn();
    cloneEl.remove = mockRemove;
    
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
    mockAppendChild.mockImplementation(() => cloneEl);
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
    
    flyTo('flying-element', 'target-element');
    
    // Should not be called when flying element is not found
    expect(mockAppendChild).not.toHaveBeenCalled();
  });
  
  it('should do nothing if target element is not found', () => {
    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'flying-element') return flyingEl;
      if (id === 'target-element') return null;
      return null;
    });
    
    flyTo('flying-element', 'target-element');
    
    // Should not be called when target element is not found
    expect(mockAppendChild).not.toHaveBeenCalled();
  });
  
  it('should clone and append flying element to document body', () => {
    flyTo('flying-element', 'target-element');
    
    expect(flyingEl.cloneNode).toHaveBeenCalledWith(true);
    expect(mockAppendChild).toHaveBeenCalled();
  });
  
  it('should set correct styles on cloned element', () => {
    flyTo('flying-element', 'target-element');
    
    expect(cloneEl.style.position).toBe('absolute');
    expect(cloneEl.style.top).toBe('100px');
    expect(cloneEl.style.left).toBe('100px');
    expect(cloneEl.style.width).toBe('100px');
    expect(cloneEl.style.height).toBe('100px');
    expect(cloneEl.style.zIndex).toBe('99');
    expect(cloneEl.style.opacity).toBe('1');
    expect(cloneEl.style.animation).toBe('none');
  });
  
  it('should set transform and transition properties with default durations', () => {
    flyTo('flying-element', 'target-element');
    
    // The deltaX should be (350 - 150) = 200, deltaY should be (350 - 150) = 200
    expect(cloneEl.style.transform).toBe('translate(200px, 200px) scale(0.1)');
    
    // Use a regular expression to match the transition value, avoiding floating-point precision issues
    expect(cloneEl.style.transition).toMatch(/transform 0\.1\d+s ease, opacity 0\.4s ease/);
  });
  
  it('should set custom durations when provided in options', () => {
    flyTo('flying-element', 'target-element', { duration: 1.0 });
    
    // Use a regular expression to match the transition value, avoiding floating-point precision issues
    expect(cloneEl.style.transition).toMatch(/transform 0\.6\d*s ease, opacity 1s ease/);
  });
  
  it('should add transitionend event listener', () => {
    flyTo('flying-element', 'target-element');
    
    expect(mockAddEventListener).toHaveBeenCalledWith('transitionend', expect.any(Function));
  });
  
  it('should use custom scale value when provided', () => {
    flyTo('flying-element', 'target-element', { scale: 0.5 });
    
    expect(cloneEl.style.transform).toBe('translate(200px, 200px) scale(0.5)');
  });
  
  it('should not move along X axis when moveX is false', () => {
    flyTo('flying-element', 'target-element', { moveX: false });
    
    expect(cloneEl.style.transform).toBe('translate(0px, 200px) scale(0.1)');
  });
  
  it('should not move along Y axis when moveY is false', () => {
    flyTo('flying-element', 'target-element', { moveY: false });
    
    expect(cloneEl.style.transform).toBe('translate(200px, 0px) scale(0.1)');
  });
  
  it('should not move along any axis when both moveX and moveY are false', () => {
    flyTo('flying-element', 'target-element', { moveX: false, moveY: false });
    
    expect(cloneEl.style.transform).toBe('translate(0px, 0px) scale(0.1)');
  });
  
  it('should remove original element by default', () => {
    // Mock the remove method
    const originalRemove = vi.fn();
    flyingEl.remove = originalRemove;
    
    flyTo('flying-element', 'target-element');
    
    // Verify the original element was removed
    expect(originalRemove).toHaveBeenCalled();
  });
  
  it('should not remove original element when removeOriginal is false', () => {
    // Mock the remove method
    const originalRemove = vi.fn();
    flyingEl.remove = originalRemove;
    
    flyTo('flying-element', 'target-element', { removeOriginal: false });
    
    // Verify the original element was not removed
    expect(originalRemove).not.toHaveBeenCalled();
  });
  
  it('should call onTransitionEnd callback and remove clone when transition ends', () => {
    const onTransitionEnd = vi.fn();
    flyTo('flying-element', 'target-element', { onTransitionEnd });
    
    // Get the callback function passed to addEventListener
    const transitionEndCallback = mockAddEventListener.mock.calls[0][1];
    
    // Simulate transition end
    transitionEndCallback();
    
    expect(onTransitionEnd).toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalled();
  });
  
  it('should work with default onTransitionEnd callback and remove clone when transition ends', () => {
    // Call flyTo without providing the onTransitionEnd callback
    flyTo('flying-element', 'target-element');
    
    // Get the callback function passed to addEventListener
    const transitionEndCallback = mockAddEventListener.mock.calls[0][1];
    
    // Verify that mockAddEventListener was called
    expect(mockAddEventListener).toHaveBeenCalledWith('transitionend', expect.any(Function));
    
    // Simulate transition end
    transitionEndCallback();
    
    // The element should still be removed even with the default callback
    expect(mockRemove).toHaveBeenCalled();
  });
  
  it('should only call onTransitionEnd once even if multiple transition events fire', () => {
    const onTransitionEnd = vi.fn();
    flyTo('flying-element', 'target-element', { onTransitionEnd });
    
    // Get the callback function passed to addEventListener
    const transitionEndCallback = mockAddEventListener.mock.calls[0][1];
    
    // Mock the remove method to track calls and also clear the element reference
    // This helps prevent multiple calls to onTransitionEnd
    let removed = false;
    mockRemove.mockImplementation(() => {
      if (!removed) {
        removed = true;
      }
    });

    // First call - should execute onTransitionEnd and remove
    transitionEndCallback();
    
    // Reset the mock to verify the second call doesn't trigger it again
    onTransitionEnd.mockClear();
    
    // Second call - should not execute onTransitionEnd again
    transitionEndCallback();
    
    // Verify onTransitionEnd was only called once in total
    expect(onTransitionEnd).not.toHaveBeenCalled();
  });
});
