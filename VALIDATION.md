# Phase 1 verification

## Automated checks

- TypeScript: app and test sources checked with `npm run typecheck`.
- Storage/logic: four passing test groups using real SQLite through a Node adapter, including the data operations behind acceptance tests A–I.
- Expo dependencies: `npx expo install --check` reports that dependencies are up to date.
- iOS bundle: `npx expo export --platform ios` completed successfully with Metro.
- Development server: `npx expo start --go --localhost --port 8085` started successfully; its health endpoint returned `packager-status:running`.
- Transactions: tests use separate SQLite connections and verify that the transaction connection has foreign keys enabled and sees schema version 1.

Native iPhone execution is not claimed by the automated tests. The Node adapter preserves the Expo SQLite API shape but does not execute its native bridge.

## iPhone acceptance checklist

Run the project in Expo Go as described in README, then check:

- [ ] A. First launch: Boxes shows Box 1 and IKEA SAMLA, with SAMLA dimensions 78 × 56 × 18 cm.
- [ ] B. Home → Pee → Box 1 → Save. Close and reopen Expo Go; the event is still in History.
- [ ] C. Home → Poop → IKEA SAMLA → Save. History and today’s poop count update.
- [ ] D. Home → Poop → Floor → Save. Outside-box count increases.
- [ ] E. Litter → Full replacement → IKEA SAMLA → Fatto / Ultra Brilliant / 10 L → Save. Boxes shows that product and 10 L.
- [ ] F. Litter → Add litter → IKEA SAMLA → 3 L → Save. Boxes shows 13 L.
- [ ] G. Clean → Wash box → IKEA SAMLA → Save. Last wash updates.
- [ ] H. Insights opens and shows rates, outside breakdown, and per-box usage without crashing.
- [ ] I. Restart Expo Go. All data is still present and there are still only two boxes.

Additional edge cases:

- [ ] Record discovery-only poop: details show unknown occurrence and the timeline marks discovery time.
- [ ] Backdate a replacement: current litter and insights follow the chosen time, not insertion order.
- [ ] Delete an addition: liters decrease and History removes the entry.
- [ ] Rename a box and make it inactive: history keeps its records and logging hides the box.
- [ ] Switch the phone to dark mode and try the keyboard/date picker.
- [ ] Only after testing with disposable data: type RESET in Settings, cancel once, then confirm a reset. Defaults return and history is empty.

No sync, backend, authentication, or remote storage has been implemented.
