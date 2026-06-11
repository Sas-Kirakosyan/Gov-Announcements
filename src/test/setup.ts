import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount React trees and clear storage between tests for isolation.
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
