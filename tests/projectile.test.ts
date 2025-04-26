// tests/projectile.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import projectile from '../src/projectile';

describe('flyToTarget', () => {
  let projectileEl: HTMLElement;
  let targetEl: HTMLElement;
  let fieldEl: HTMLElement;
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

    fieldEl = document.createElement('div');
    fieldEl.id = 'field';
    document.body.appendChild(fieldEl);

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

    fieldEl.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 0,
      left: 0,
      right: 1000,
      bottom: 1000,
      width: 1000,
      height: 1000
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
      if (id === 'field') return fieldEl;
      return null;
    });

    mockAppendChild = vi.spyOn(fieldEl, 'appendChild');
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

  it('should do nothing if projectile element is not found', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'projectile-element') return null;
      if (id === 'target-element') return targetEl;
      if (id === 'field') return fieldEl;
      return null;
    });

    projectile('projectile-element', 'target-element');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid IDs provided to flyToTarget');
    expect(mockAppendChild).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should do nothing if target element is not found', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'projectile-element') return projectileEl;
      if (id === 'target-element') return null;
      if (id === 'field') return fieldEl;
      return null;
    });

    projectile('projectile-element', 'target-element');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid IDs provided to flyToTarget');
    expect(mockAppendChild).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should do nothing if field element is not found', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockGetElementById.mockImplementation((id: string) => {
      if (id === 'projectile-element') return projectileEl;
      if (id === 'target-element') return targetEl;
      if (id === 'field') return null;
      return null;
    });

    projectile('projectile-element', 'target-element');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid IDs provided to flyToTarget');
    expect(mockAppendChild).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
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

    // Mock performance.now to return a time after animation should end
    mockPerformanceNow.mockReturnValue(1000); // exactly at animation end

    // Mock the requestAnimationFrame to reset the call count
    mockRequestAnimationFrame.mockClear();
    
    // Call the animation callback
    animateCallback(1000);
  
    // Should not request another frame since animation is complete
    expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(0);

    // Should remove the clone element
    expect(mockRemove).toHaveBeenCalled();
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

});