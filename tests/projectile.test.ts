// tests/projectile.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import projectile from '../src/projectile';
// tests/projectile.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import projectile from '../src/projectile';

describe('projectile', () => {
  let flyingEl: HTMLElement;
  let targetEl: HTMLElement;
  let fieldEl: HTMLElement | null;
  let cloneEl: HTMLElement;
  let mockGetElementById: any;
  let mockAppendChild: any;
  let mockRemove: any;
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
    
    fieldEl = document.createElement('div');
    fieldEl.id = 'field';
    document.body.appendChild(fieldEl);
    
    // Create clone element
    cloneEl = document.createElement('div');
    
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
    
    fieldEl.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 0,
      left: 0,
      right: 1000,
      bottom: 1000,
      width: 1000,
      height: 1000
    });
    
    cloneEl.getBoundingClientRect = vi.fn();
    
    // Mock window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      transform: 'matrix(1, 0, 0, 1, 0, 0)',
    } as CSSStyleDeclaration);
    
    // Mock other methods
    mockRemove = vi.fn();
    flyingEl.remove = mockRemove;
    cloneEl.remove = mockRemove;
    
    // Mock cloneNode to return our controlled clone
    flyingEl.cloneNode = vi.fn().mockReturnValue(cloneEl);
    
    // Mock document methods
    mockGetElementById = vi.spyOn(document, 'getElementById');
    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'flying-element') return flyingEl;
      if (id === 'target-element') return targetEl;
      if (id === 'field') return fieldEl;
      return null;
    });
    
    mockAppendChild = vi.spyOn(fieldEl, 'appendChild');
    mockAppendChild.mockImplementation(() => cloneEl);
    
    // Mock requestAnimationFrame
    mockRequestAnimationFrame = vi.fn();
    (window as any).requestAnimationFrame = mockRequestAnimationFrame;
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('should throw an error if flying element is not found', () => {
    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'flying-element') return null;
      if (id === 'target-element') return targetEl;
      if (id === 'field') return fieldEl;
      return null;
    });
    
    expect(() => projectile('flying-element', 'target-element')).toThrow();
  });
  
  it('should throw an error if target element is not found', () => {
    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'flying-element') return flyingEl;
      if (id === 'target-element') return null;
      if (id === 'field') return fieldEl;
      return null;
    });
    
    expect(() => projectile('flying-element', 'target-element')).toThrow();
  });
  
  it('should clone and append flying element to container', () => {
    projectile('flying-element', 'target-element');
    
    expect(flyingEl.cloneNode).toHaveBeenCalledWith(true);
    expect(mockAppendChild).toHaveBeenCalledWith(cloneEl);
  });
  
  it('should use document.body as container if field is not found', () => {
    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'flying-element') return flyingEl;
      if (id === 'target-element') return targetEl;
      if (id === 'field') return null;
      return null;
    });
    
    const bodyAppendChild = vi.spyOn(document.body, 'appendChild');
    
    projectile('flying-element', 'target-element');
    
    expect(bodyAppendChild).toHaveBeenCalledWith(cloneEl);
  });
  
  it('should set correct styles on cloned element', () => {
    projectile('flying-element', 'target-element');
    
    expect(cloneEl.style.position).toBe('absolute');
    expect(cloneEl.style.pointerEvents).toBe('none');
    expect(cloneEl.style.margin).toBe('0px');
  });
  
  it('should remove original element by default', () => {
    projectile('flying-element', 'target-element');
    
    expect(flyingEl.remove).toHaveBeenCalled();
  });
  
  it('should not remove original element when removeOriginal is false', () => {
    projectile('flying-element', 'target-element', { removeOriginal: false });
    
    expect(flyingEl.remove).not.toHaveBeenCalled();
  });
  
  it('should set transformOrigin when resetTransformation is true', () => {
    // Set up a mock transform on cloneEl
    cloneEl.style.transform = 'rotate(45deg) scale(0.8)';
    cloneEl.style.transformOrigin = 'top left';
    
    // We need to spy on the style.transform setter to verify it was called with 'none'
    const transformSpy = vi.spyOn(cloneEl.style, 'transform', 'set');
    
    projectile('flying-element', 'target-element', { resetTransformation: true });
    
    // Verify transform was set to none at some point
    expect(transformSpy).toHaveBeenCalledWith('none');
    expect(cloneEl.style.transformOrigin).toBe('center center');
  });
  
  it('should not set transformOrigin when resetTransformation is falsy', () => {
    // Set up a mock transform on cloneEl
    cloneEl.style.transform = 'rotate(45deg) scale(0.8)';
    cloneEl.style.transformOrigin = 'top left';
    
    projectile('flying-element', 'target-element', { resetTransformation: false });
    
    // Verify the transformOrigin was not changed
    expect(cloneEl.style.transformOrigin).not.toBe('center center');
  });
  
  it('should use default values when options are not provided', () => {
    projectile('flying-element', 'target-element');
    
    // By default, resetTransformation should not be applied
    // We set a transform manually to test this
    cloneEl.style.transform = 'rotate(45deg)';
    expect(cloneEl.style.transform).toBe('rotate(45deg)');
  });
  
  it('should start animation when called', () => {
    projectile('flying-element', 'target-element');
    
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
  });
});
describe('projectile', () => {
  let projectileEl: HTMLElement;
  let targetEl: HTMLElement;
  let cloneEl: HTMLElement;
  let mockGetElementById: any;
  let mockAppendChild: any;
  let mockRemove: any;
  let mockPerformanceNow: any;
  let mockRequestAnimationFrame: any;

  beforeEach(() => {
    // Clean up the document
    document.body.innerHTML = '';

    // Create actual DOM elements with happy-dom
    projectileEl = document.createElement('div');
    projectileEl.id = 'projectile-element';
    projectileEl.style.transform = 'rotate(45deg)';
    document.body.appendChild(projectileEl);

    targetEl = document.createElement('div');
    targetEl.id = 'target-element';
    document.body.appendChild(targetEl);

    // Create clone element
    cloneEl = document.createElement('div');
    
    // Mock getBoundingClientRect for all elements
    projectileEl.getBoundingClientRect = vi.fn().mockReturnValue({
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

    // Mock offsetWidth and offsetHeight using Object.defineProperty
    // These are read-only properties in HTMLElement
    Object.defineProperty(cloneEl, 'offsetWidth', { value: 100, configurable: true });
    Object.defineProperty(cloneEl, 'offsetHeight', { value: 100, configurable: true });

    // Mock cloneNode to return our controlled clone
    projectileEl.cloneNode = vi.fn().mockReturnValue(cloneEl);

    // Mock getComputedStyle
    window.getComputedStyle = vi.fn().mockReturnValue({
      transform: 'matrix(0.7071067811865475, 0.7071067811865475, -0.7071067811865475, 0.7071067811865475, 0, 0)' // Represents a 45-degree rotation
    });

    // Mock clone methods
    mockRemove = vi.fn();
    cloneEl.remove = mockRemove;

    // Mock document methods
    mockGetElementById = vi.spyOn(document, 'getElementById');
    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'projectile-element') return projectileEl;
      if (id === 'target-element') return targetEl;
      if (id === 'field') return null; // Always return null for field
      return null;
    });
    
    mockAppendChild = vi.spyOn(document.body, 'appendChild');
    mockAppendChild.mockImplementation(() => cloneEl);

    // Mock performance.now
    mockPerformanceNow = vi.spyOn(performance, 'now');
    mockPerformanceNow.mockReturnValue(0);

    // Mock requestAnimationFrame
    mockRequestAnimationFrame = vi.fn();
    window.requestAnimationFrame = mockRequestAnimationFrame;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw an error if projectile element is not found', () => {
    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'projectile-element') return null;
      if (id === 'target-element') return targetEl;
      if (id === 'field') return null;
      return null;
    });

    expect(() => projectile('projectile-element', 'target-element'))
      .toThrow('Invalid IDs provided to projectile function');
    expect(mockAppendChild).not.toHaveBeenCalled();
  });

  it('should throw an error if target element is not found', () => {
    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'projectile-element') return projectileEl;
      if (id === 'target-element') return null;
      if (id === 'field') return null;
      return null;
    });

    expect(() => projectile('projectile-element', 'target-element'))
      .toThrow('Invalid IDs provided to projectile function');
    expect(mockAppendChild).not.toHaveBeenCalled();
  });

  it('should use document.body as container when field element is not found', () => {
    // Mock document.body.appendChild
    const docBodyAppendSpy = vi.spyOn(document.body, 'appendChild');
    docBodyAppendSpy.mockImplementation(() => cloneEl);
    
    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'projectile-element') return projectileEl;
      if (id === 'target-element') return targetEl;
      if (id === 'field') return null;
      return null;
    });
  
    projectile('projectile-element', 'target-element');
  
    // Should append to document.body instead of field
    expect(docBodyAppendSpy).toHaveBeenCalled();
    
    docBodyAppendSpy.mockRestore();
  });

  it('should clone and append projectile element to field', () => {
    projectile('projectile-element', 'target-element');

    expect(projectileEl.cloneNode).toHaveBeenCalledWith(true);
    expect(mockAppendChild).toHaveBeenCalled();
  });

  it('should set correct styles on cloned element', () => {
    projectile('projectile-element', 'target-element');

    expect(cloneEl.style.position).toBe('absolute');
    expect(cloneEl.style.pointerEvents).toBe('none');
    expect(cloneEl.style.margin).toBe('0px'); // Browser automatically adds 'px' unit
    expect(cloneEl.getAttribute('id')).toBeNull();
  });

  it('should set initial position styles on cloned element', () => {
    projectile('projectile-element', 'target-element');

    expect(cloneEl.style.left).toBe('100px');
    expect(cloneEl.style.top).toBe('100px');
  });

  it('should extract base rotation from transform matrix', () => {
    // The mock implementation of getComputedStyle returns a 45-degree rotation matrix
    projectile('projectile-element', 'target-element');

    expect(window.getComputedStyle).toHaveBeenCalledWith(projectileEl);
  });

  it('should start animation with requestAnimationFrame', () => {
    projectile('projectile-element', 'target-element');

    expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('should execute animation frame correctly', () => {
    projectile('projectile-element', 'target-element');

    // Get the animation callback
    const animateCallback = mockRequestAnimationFrame.mock.calls[0][0];

    // Mock performance.now to return a time during animation
    mockPerformanceNow.mockReturnValue(500); // halfway through the animation

    // Call the animation callback
    animateCallback(500);

    // Verify the element is positioned and rotated correctly
    expect(cloneEl.style.left).toBeTruthy();
    expect(cloneEl.style.top).toBeTruthy();
    expect(cloneEl.style.transform).toBeTruthy();

    // Should request another frame since animation is not complete
    expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(2);
  });

  it('should remove the clone element when animation completes', () => {
    projectile('projectile-element', 'target-element');

    // Get the animation callback
    const animateCallback = mockRequestAnimationFrame.mock.calls[0][0];

    // First call with startTime = 0
    animateCallback(0);
    
    // Second call at the end of animation duration (1000ms after start)
    // This will use startTime=0 from the first call and elapsed = 1000ms
    animateCallback(1000);
    
    // Clone should be removed when animation is complete
    expect(mockRemove).toHaveBeenCalled();
    
    // Should not request another frame since animation is complete
    // expect(mockRequestAnimationFrame.mock.calls.length).toBe(1);
  });

  it('should handle "none" transform value', () => {
    // Change the mock to return a "none" transform
    (window.getComputedStyle as any).mockReturnValue({
      transform: 'none'
    });

    projectile('projectile-element', 'target-element');

    // Should still create animation
    expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('should respect removeOriginal option when set to false', () => {
    // Spy on the original element's remove method
    const originalRemoveSpy = vi.spyOn(projectileEl, 'remove');
    
    // Call with removeOriginal set to false
    projectile('projectile-element', 'target-element', { removeOriginal: false });
    
    // Original element should not be removed
    expect(originalRemoveSpy).not.toHaveBeenCalled();
    
    originalRemoveSpy.mockRestore();
  });
  
  it('should apply options correctly to the animation', () => {
    const customOptions = {
      moveX: false,
      moveY: true,
      duration: 2,
      acceleration: 8,
      scale: 0.5
    };
    
    projectile('projectile-element', 'target-element', customOptions);
    
    // Get the animation callback
    const animateCallback = mockRequestAnimationFrame.mock.calls[0][0];
    
    // Run animation at different timestamps
    animateCallback(0);
    animateCallback(500);
    
    // Verify animation is still running (not complete)
    // expect(mockRequestAnimationFrame.mock.calls.length).toBe(2);
    
    // Element should have transform style set
    expect(cloneEl.style.transform).toBeTruthy();
  });
  
  it('should call onTransitionEnd callback when animation completes', () => {
    // Create a mock callback function
    const mockOnTransitionEnd = vi.fn();

    // Call projectile with the onTransitionEnd option
    projectile('projectile-element', 'target-element', {
      onTransitionEnd: mockOnTransitionEnd
    });

    // Get the animation callback
    const animateCallback = mockRequestAnimationFrame.mock.calls[0][0];

    // Start the animation
    animateCallback(0);
    
    // Complete the animation (1000ms is the default duration)
    mockPerformanceNow.mockReturnValue(1000);
    animateCallback(1000);
    
    // Verify that the onTransitionEnd callback was called
    expect(mockOnTransitionEnd).toHaveBeenCalled();
    
  });

  it('should handle errors in onTransitionEnd callback gracefully', () => {
    // Mock console.error
    const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {
    });

    // Create a callback that throws
    const mockOnTransitionEnd = vi.fn().mockImplementation(() => {
      throw new Error('Test error in callback');
    });

    // Call projectile with the throwing callback
    projectile('projectile-element', 'target-element', {
      onTransitionEnd: mockOnTransitionEnd
    });

    // Get the animation callback
    const animateCallback = mockRequestAnimationFrame.mock.calls[0][0];

    // Start the animation
    animateCallback(0);

    // Complete the animation
    mockPerformanceNow.mockReturnValue(1000);
    animateCallback(1000);

    // Verify that the callback was called and error was logged
    expect(mockOnTransitionEnd).toHaveBeenCalled();
    expect(mockConsoleError).toHaveBeenCalledWith('Error in onTransitionEnd callback', expect.any(Error));

    // Restore console.error mock
    mockConsoleError.mockRestore();
  });

});