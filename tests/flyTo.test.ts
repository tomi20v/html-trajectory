// tests/flyTo.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flyTo } from '../src/flyTo';

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
  
  it('should set transform and transition properties', () => {
    flyTo('flying-element', 'target-element');
    
    // The deltaX should be (350 - 150) = 200, deltaY should be (350 - 150) = 200
    expect(cloneEl.style.transform).toBe('translate(200px, 200px) scale(0.2)');
    expect(cloneEl.style.transition).toBe('transform 0.4s ease, opacity 0.6s ease');
  });
  
  it('should add transitionend event listener', () => {
    flyTo('flying-element', 'target-element');
    
    expect(mockAddEventListener).toHaveBeenCalledWith('transitionend', expect.any(Function));
  });
  
  it('should call onTransitionEnd callback and remove clone when transition ends', () => {
    const onTransitionEnd = vi.fn();
    flyTo('flying-element', 'target-element', onTransitionEnd);
    
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
  });
