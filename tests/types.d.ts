// Type definitions for test environment
import { HappyDOMWindow } from 'happy-dom';

// Declare global variables in test environment
declare global {
  interface Window {
    requestAnimationFrame: (callback: FrameRequestCallback) => number;
    performance: {
      now: () => number;
    };
  }
  
  // Ensure window properties are available globally in tests
  var requestAnimationFrame: Window['requestAnimationFrame'];
  var performance: Window['performance'];
}
