const fs = require("fs");
const path = require("path");

const rule = require("./version-sync");

// Minimal eslint RuleTester-style harness
function runRule(appJsonContent) {
  const reports = [];
  const appJsonPath = path.resolve(process.cwd(), "app.json");
  const originalReadFileSync = fs.readFileSync;

  fs.readFileSync = (filePath, encoding) => {
    if (filePath === appJsonPath) {
      return typeof appJsonContent === "string"
        ? appJsonContent
        : JSON.stringify(appJsonContent);
    }
    return originalReadFileSync(filePath, encoding);
  };

  try {
    const listeners = rule.create({
      cwd: process.cwd(),
      report(descriptor) {
        reports.push(descriptor);
      },
    });
    listeners.Program();
  } finally {
    fs.readFileSync = originalReadFileSync;
  }

  return reports;
}

describe("version-sync", () => {
  it("passes when top-level version and runtimeVersion match", () => {
    const reports = runRule({
      expo: { version: "1.2.0", runtimeVersion: "1.2.0" },
    });
    expect(reports).toHaveLength(0);
  });

  it("fails when top-level version and runtimeVersion differ", () => {
    const reports = runRule({
      expo: { version: "1.1.0", runtimeVersion: "1.2.0" },
    });
    expect(reports).toHaveLength(1);
    expect(reports[0].messageId).toBe("mismatch");
    expect(reports[0].data.version).toBe("1.1.0");
    expect(reports[0].data.runtimeVersion).toBe("1.2.0");
    expect(reports[0].data.scope).toBe("top-level");
  });

  it("passes when runtimeVersion is not a string (e.g. policy object)", () => {
    const reports = runRule({
      expo: { version: "1.0.0", runtimeVersion: { policy: "fingerprint" } },
    });
    expect(reports).toHaveLength(0);
  });

  it("passes when runtimeVersion is missing", () => {
    const reports = runRule({
      expo: { version: "1.0.0" },
    });
    expect(reports).toHaveLength(0);
  });

  it("passes when version is missing", () => {
    const reports = runRule({
      expo: { runtimeVersion: "1.0.0" },
    });
    expect(reports).toHaveLength(0);
  });

  it("passes when per-platform versions match their runtimeVersions", () => {
    const reports = runRule({
      expo: {
        ios: { version: "1.3.1", runtimeVersion: "1.3.1" },
        android: { version: "1.4.0", runtimeVersion: "1.4.0" },
      },
    });
    expect(reports).toHaveLength(0);
  });

  it("fails when ios version and runtimeVersion differ", () => {
    const reports = runRule({
      expo: {
        ios: { version: "1.3.1", runtimeVersion: "1.3.0" },
        android: { version: "1.4.0", runtimeVersion: "1.4.0" },
      },
    });
    expect(reports).toHaveLength(1);
    expect(reports[0].data.scope).toBe("ios");
    expect(reports[0].data.version).toBe("1.3.1");
  });

  it("fails when android version and runtimeVersion differ", () => {
    const reports = runRule({
      expo: {
        ios: { version: "1.3.1", runtimeVersion: "1.3.1" },
        android: { version: "1.4.0", runtimeVersion: "1.3.0" },
      },
    });
    expect(reports).toHaveLength(1);
    expect(reports[0].data.scope).toBe("android");
  });

  it("reports multiple mismatches across platforms", () => {
    const reports = runRule({
      expo: {
        version: "1.0.0",
        runtimeVersion: "1.1.0",
        ios: { version: "1.3.1", runtimeVersion: "1.2.0" },
      },
    });
    expect(reports).toHaveLength(2);
  });
});
