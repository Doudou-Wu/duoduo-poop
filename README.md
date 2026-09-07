# Duoduo Poop 🐱

A small, local journal for Duoduo’s toilet habits and litter-box care. Phase 1 uses Expo, React Native, TypeScript, Expo Router, and `expo-sqlite`. There is no backend, authentication, or GitHub sync.

## Start on Windows and open on iPhone

Prerequisites:

- Windows PC with Node.js 24 LTS (npm is included). Expo SDK 57 requires Node 22.13 or newer; Node 24 is recommended for the included SQLite tests.
- An iPhone with iOS 16.4 or newer and the latest Expo Go from the App Store, supporting SDK 57.
- Preferably, the PC and iPhone on the same Wi-Fi network.

Open PowerShell and run:

```powershell
cd "C:\Users\wddwd\Documents\Codex\2026-09-08\files-pasted-by-the-user-build\outputs\duoduo-poop"
npm install
npx expo start --go
```

Keep this terminal open. Scan the QR code using the iPhone Camera and tap **Open in Expo Go**. If Expo Go offers a QR scanner, that works too. Allow Expo Go access to the local network when iOS asks. An Expo account, Mac, Xcode, and Apple developer membership are not needed for this Expo Go workflow.

For later launches, run `npx expo start --go` in the same project folder. Stop Metro with **Ctrl+C**. Do not use `npm run ios` on Windows: that shortcut tries to open the iOS simulator, which requires macOS.

### Connection and Metro troubleshooting

- **QR code does not connect:** check that both devices are on the same Wi-Fi. Avoid guest networks that isolate devices. Allow Node.js through Windows Firewall on your private network. Turn off a VPN temporarily if it blocks the connection.
- **LAN still fails:** stop Metro, then use tunnel mode. It needs internet access and may ask to install Expo’s tunnel helper:

  ```powershell
  npx expo start --go --tunnel
  ```

- **Stale screens, Metro import error, or cache trouble:** stop Metro and run:

  ```powershell
  npx expo start --go -c
  ```

- **Port 8081 is busy:** stop the earlier terminal or use `npx expo start --go --port 8082`, then scan the new QR code.
- **Dependencies missing:** run `npm install`, then `npx expo install --check`. For a repeatable clean install with the included lockfile, use `npm ci`.
- **npm DNS errors on this network:** the primary npm registry was unreachable during development. The installation was verified using this mirror:

  ```powershell
  npm install --registry=https://registry.npmmirror.com
  ```

  The lockfile includes URLs from that mirror. No global npm registry setting is changed by these instructions.

- **Expo Go version mismatch:** update Expo Go. The project targets SDK 57; do not independently upgrade React or React Native. Check [Expo’s compatibility page](https://expo.dev/go) if the installed Expo Go supports a different SDK.

## Using the app

- **Home:** today’s pee, poop, and outside-box counts; four quick actions; up to the latest 10 actual records. No sample events are added.
- **Fast pee/poop:** tap the action, tap the location, tap **Save event**. Time defaults to the save time. **Add details** reveals a native date/time picker, notes, optional consistency/amount, and discovery-only logging.
- **Cleaning:** Clean → Scoop or Wash box → box → Save. Optional time and notes are under Add details.
- **Litter:** Litter → Add or Full replacement → box → brand, product, liters → Save. Existing replacement product is prefilled when available. Positive decimal liters are accepted, including a decimal comma.
- **History:** all records by occurrence time (discovery time when unknown), newest first. Filter by type, tap for details, and delete with confirmation. Correct an event by deleting it and recording a replacement; event editing is deliberately omitted for v0.1.
- **Boxes:** editable name, dimensions, notes, and active status. Inactive boxes remain in history and insights but disappear from record choices. The model and UI work with any number of database boxes; adding new boxes through the UI is outside Phase 1.
- **Settings:** share counts/version for debugging, or type `RESET` and confirm the destructive dialog to reset everything. Debug sharing is not a backup and contains no event notes.

The two first-launch boxes are **Box 1** and **IKEA SAMLA**, with SAMLA dimensions 78 × 56 × 18 cm (length × width × height). Seeding is transactional and marked in `app_settings`; it never overwrites edited names or inactive status on restart.

## Local data and calculations

- `duoduo-poop.db` is stored in Expo SQLite’s default documents location on the phone. Records persist across app restarts. Clearing Expo Go’s data or uninstalling it can remove the journal. Phase 1 has no restore/import or cloud backup.
- Timestamps are ISO 8601 UTC strings. Screens render them in the device’s local time zone. Today uses the local calendar day. Discovery-only records use discovery time for ordering and daily counts and are visibly labeled.
- The latest full replacement by event time sets a box’s current product and liters. Later additions increase liters, even when a different product was added. Mixed products are labeled. An addition before any known replacement is shown as recorded additions with an unknown starting amount. Washing and scooping do not change estimated liters.
- A litter event and its `litter_changes` row are written in one exclusive transaction. Deleting the event cascades to the litter change; derived totals are recalculated. Bound SQL parameters protect notes and names. Foreign keys, constraints, WAL, and a versioned migration protect local consistency.
- Overall success is in-box events divided by all events of that type. A zero denominator shows no data, not a misleading 0%.

### Litter product and age insights: explicit attribution rule

An outside-box poop has no litter-box ID, so its product and litter age cannot be uniquely identified. Phase 1 uses **box-context observations**:

1. For poop in a box, count a success only for the box used, using its latest full replacement at or before the occurrence time.
2. For outside poop, count a failure for each box with a known replacement at that time. Different boxes can contribute to different products or age buckets. If two boxes use the same product, that product receives two failure observations.
3. Additions keep the replacement’s product label and do not reset litter age. Buckets use completed 24-hour periods: 0–1, 2–3, 4–7, and 8+ days.
4. Exclude unknown/approximate occurrence times and contexts lacking replacement history from product and age statistics. Keep those events in overall counts. The screen shows the excluded poop count.
5. Current active status is only a logging preference. Historical activation changes are not modeled; a box with known replacement history remains a possible context. Box creation timestamps refer to app setup, so backdated litter records are valid.

These are descriptive observations, not causal comparisons. Product/age denominators can exceed the overall number of poop events. The method is also explained on the Insights screen and in `utils/stats.ts`.

## Important files

```text
app/(tabs)/                 Home, History, Boxes, Insights
app/record.tsx              Fast logging and optional details
app/event/[id].tsx          Event details and confirmed deletion
app/box/[id].tsx            Box editor
app/settings.tsx           Debug share and confirmed reset
components/DataProvider.tsx Local data loading and refresh
components/                Shared native UI and cards
db/database.ts             Open/reuse SQLite connection and reset
db/migrations.ts           Schema v1 and idempotent seeding
db/transaction.ts          Private write connections with foreign keys enabled
db/events.ts               Validation and atomic event/litter creation
db/litterBoxes.ts          Box reads/updates
db/litterChanges.ts        Litter change reads
types/models.ts            Typed data models
utils/stats.ts             Box status and documented insights
tests/                     Real SQLite storage/logic tests via Node
```

## Checks

```powershell
npm run typecheck
npm test
npx expo install --check
npx expo export --platform ios --output-dir .expo-check
```

The tests execute the production migrations, queries, validation, and calculations against a real on-disk SQLite database via a small Node API adapter. They close/reopen the file to check persistence, verify 10 + 3 liters, reset/reseeding, deletion, failed-save rollback, inactive boxes, unknown times, backdated replacement, and age buckets. They do **not** test Expo’s native iOS SQLite bridge or phone touch interactions.

The iPhone acceptance pass remains necessary: this Windows environment cannot run an iOS simulator. See `VALIDATION.md` for the exact verified checks and phone checklist. Confirm local behavior on your iPhone before moving on to any future sync phase.

Technical references: [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), [Expo SQLite](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/), [Expo Router](https://docs.expo.dev/versions/v57.0.0/sdk/router/).
