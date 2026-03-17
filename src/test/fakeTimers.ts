/** Default fake date: March 2, 2026 — used across most tests. */
const DEFAULT_NOW = new Date(2026, 2, 2);

/** Sets up fake timers with a fixed date. Call in beforeEach. */
export function setupFakeTimers(now: Date = DEFAULT_NOW) {
  jest.useFakeTimers({ now });
}

/** Restores real timers and all mocks. Call in afterEach. */
export function teardownFakeTimers() {
  jest.useRealTimers();
  jest.restoreAllMocks();
}
