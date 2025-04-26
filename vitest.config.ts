import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use happy-dom to simulate browser environment
    environment: 'happy-dom',
    // Useful for debugging
    globals: true
  }
});
