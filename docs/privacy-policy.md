# Privacy Policy

**in due time**
*Effective date: March 16, 2026*

## Overview

in due time is a pregnancy tracking app designed for midwives and birth workers. Your privacy is important to us. This policy explains what data the app collects, how it is used, and your choices.

## Data we collect

### Data you provide

When you use in due time, you enter names and due dates for the pregnancies you are tracking. The app encourages you to use first names or nicknames only — no last names, medical IDs, or other identifying information.

### Data stored on your device

All pregnancy entries (names, due dates, delivery dates) and your preferences (theme, brightness, layout, auto-cleanup period) are stored locally on your device using AsyncStorage. **This data is never sent to a server or backed up to the cloud.**

### Device identifier

The app generates a random, anonymous identifier (UUID) on first launch. This identifier is not linked to your identity, device serial number, or any account. It is used solely for anonymous analytics if you have not opted out.

### Analytics data

The app uses Vexo Analytics to collect basic, anonymous usage information:

- Your random device identifier
- App version and platform (iOS/Android)
- Basic session information

**Analytics is optional.** You can opt out at any time in the app's settings. When you opt out, the analytics service is never initialized and no data is sent.

Analytics data is not collected in development builds or internal test builds.

### Update checks

The app uses Expo Updates to check for available updates. These checks send only app version information to Expo's servers — no personal data or pregnancy entries are transmitted.

## Data we do not collect

- Last names or full legal names
- Medical records, diagnoses, or health history
- Location data
- Photos, contacts, or calendar data
- Email addresses or phone numbers
- Financial or payment information

The app includes several device capability modules (camera, contacts, calendar, location) in its dependencies but **none of these are used or activated**. No device permissions for these capabilities are requested.

## How we use your data

- **Pregnancy entries**: Displayed only within the app on your device. Never transmitted.
- **Preferences**: Used to personalize your app experience. Never transmitted.
- **Device identifier and analytics**: Used to understand aggregate app usage patterns (e.g., how many active users). Never linked to your identity.
- **Update checks**: Used to deliver bug fixes and improvements.

## Data sharing

We do not sell, rent, or share your personal data with third parties.

The only data transmitted from the app is:

| Data | Recipient | Purpose | Your control |
|------|-----------|---------|--------------|
| Anonymous device ID + app version | Vexo Analytics | Aggregate usage statistics | Opt out in Settings |
| App version info | Expo (update server) | Deliver app updates | Automatic |

When you choose to submit a bug report or feature request, you are directed to a Google Form. Any information you provide in that form is governed by [Google's Privacy Policy](https://policies.google.com/privacy).

## Data retention

- **On-device data**: Remains on your device until you delete it or uninstall the app. Delivered entries can be set to auto-remove after a configurable period (up to 30 days).
- **Analytics data**: Retained by Vexo Analytics per their data retention policies. Since only an anonymous UUID is sent, this data cannot be linked back to you.

## Data security

All data is stored locally on your device within the app's private storage sandbox. The app does not use custom encryption — it relies on the operating system's built-in app sandboxing and any device-level encryption you have enabled.

## Children's privacy

in due time is not directed at children under 13 and does not knowingly collect data from children.

## Your choices

- **Opt out of analytics**: Toggle analytics off in the app's settings at any time.
- **Delete your data**: Remove individual entries within the app, or uninstall the app to delete all stored data.
- **Auto-cleanup**: Configure delivered entries to be automatically removed after a set number of days.

## Changes to this policy

We may update this privacy policy from time to time. The effective date at the top of this page indicates when the policy was last revised.

## Contact

If you have questions about this privacy policy, you can reach us through the bug report form in the app's settings or by contacting the developer at the email address listed on the Google Play store listing.
