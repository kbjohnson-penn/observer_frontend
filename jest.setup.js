// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill structuredClone for Node < 17
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => {
    if (obj === undefined) {
      return undefined;
    }
    return JSON.parse(JSON.stringify(obj));
  };
}

// Suppress act() warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('not wrapped in act')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
