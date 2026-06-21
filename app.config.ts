import { ConfigContext, ExpoConfig } from "expo/config";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const appJson = require("./app.json") as { expo: ExpoConfig };

// Version/runtimeVersion are set per-platform in app.json (iOS 1.3.3, Android 1.4.0).
// Bump both version AND runtimeVersion together in app.json when native deps change.
//
// NOTE: Expo only honors per-platform `runtimeVersion`, NOT per-platform `version`
// (the marketing version / CFBundleShortVersionString is a top-level-only field).
// So we promote the correct per-platform `version` from app.json to the top level
// based on the build platform. Without this, Expo sees no top-level version and
// defaults to "1.0.0".

const IS_DEV = process.env.APP_VARIANT === "development";

const iosVersion = (appJson.expo.ios as { version?: string } | undefined)
  ?.version;
const androidVersion = (
  appJson.expo.android as { version?: string } | undefined
)?.version;
// EAS sets EAS_BUILD_PLATFORM to "ios" or "android" during a build; defaults to
// the iOS version locally (e.g. `expo config`, dev client).
const version =
  process.env.EAS_BUILD_PLATFORM === "android" ? androidVersion : iosVersion;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...appJson.expo,
  ...config,
  version,
  name: IS_DEV ? "in due time (Dev)" : appJson.expo.name,
  icon: IS_DEV ? "./assets/icon-dark.png" : undefined,
  ios: {
    ...appJson.expo.ios,
    bundleIdentifier: IS_DEV
      ? "com.andybircher.induetime.dev"
      : appJson.expo.ios?.bundleIdentifier,
  },
  android: {
    ...appJson.expo.android,
    package: IS_DEV
      ? "com.andybircher.induetime.dev"
      : appJson.expo.android?.package,
  },
  extra: {
    ...appJson.expo.extra,
    appLabel: process.env.APP_LABEL ?? "",
    easBuildId: process.env.EAS_BUILD_ID ?? "",
  },
});
