import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom does not implement scrolling; stub it so components that scroll on
// interaction (e.g. the feed's pager) don't emit "Not implemented" noise.
window.scrollTo = vi.fn();

// Unmount React trees and clear storage between tests for isolation.
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
