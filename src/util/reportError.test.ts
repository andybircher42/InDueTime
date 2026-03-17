import { Alert } from "react-native";

import { reportError } from "./reportError";

const originalDev = (global as Record<string, unknown>).__DEV__;

afterEach(() => {
  (global as Record<string, unknown>).__DEV__ = originalDev;
  jest.restoreAllMocks();
});

describe("reportError", () => {
  describe("DEV mode", () => {
    beforeEach(() => {
      (global as Record<string, unknown>).__DEV__ = true;
    });

    it("logs to console.error with context and error", () => {
      const spy = jest.spyOn(console, "error").mockImplementation();
      const err = new Error("boom");
      reportError("Loading data", err);
      expect(spy).toHaveBeenCalledWith("Loading data", err);
    });

    it("handles Error instances", () => {
      const spy = jest.spyOn(console, "error").mockImplementation();
      const err = new Error("specific message");
      reportError("Context", err);
      expect(spy).toHaveBeenCalledWith("Context", err);
    });

    it("handles string errors", () => {
      const spy = jest.spyOn(console, "error").mockImplementation();
      reportError("Context", "string error");
      expect(spy).toHaveBeenCalledWith("Context", "string error");
    });

    it("handles null/undefined by not crashing", () => {
      const spy = jest.spyOn(console, "error").mockImplementation();
      reportError("Context", null);
      expect(spy).toHaveBeenCalledWith("Context", null);

      reportError("Context", undefined);
      expect(spy).toHaveBeenCalledWith("Context", undefined);
    });
  });

  describe("Production mode", () => {
    beforeEach(() => {
      (global as Record<string, unknown>).__DEV__ = false;
    });

    it("shows Alert.alert with context and message", () => {
      const spy = jest.spyOn(Alert, "alert").mockImplementation();
      reportError("Network error", new Error("timeout"));
      expect(spy).toHaveBeenCalledWith("Network error", "timeout");
    });

    it("uses error.message for Error instances", () => {
      const spy = jest.spyOn(Alert, "alert").mockImplementation();
      reportError("Save failed", new Error("disk full"));
      expect(spy).toHaveBeenCalledWith("Save failed", "disk full");
    });

    it("stringifies non-Error values", () => {
      const spy = jest.spyOn(Alert, "alert").mockImplementation();
      reportError("Oops", "raw string");
      expect(spy).toHaveBeenCalledWith("Oops", "raw string");

      reportError("Oops", 42);
      expect(spy).toHaveBeenCalledWith("Oops", "42");
    });

    it("uses 'Unknown error' for null/undefined", () => {
      const spy = jest.spyOn(Alert, "alert").mockImplementation();
      reportError("Oops", null);
      expect(spy).toHaveBeenCalledWith("Oops", "Unknown error");

      reportError("Oops", undefined);
      expect(spy).toHaveBeenCalledWith("Oops", "Unknown error");
    });
  });
});
