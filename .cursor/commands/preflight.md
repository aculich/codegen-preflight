# Preflight: refresh versions + model catalog

You are the Cursor Agent. Do this in order:

1) **Force refresh the snapshot** (even if one was done today):
   - Run: `npm run preflight` in the terminal
   - This will generate a fresh snapshot and update `.cursor/rules/01-version-snapshot.mdc`
   - Wait for it to complete before proceeding

2) Open `.cursor/rules/01-version-snapshot.mdc` and confirm:
   - It has today's timestamp
   - It lists latest SDK versions
   - It lists selected default models
   - It includes provenance information showing where the data came from

3) Tell me what changed since the last snapshot (if any), and what model IDs you will use for:
   - reasoning
   - fast
   - vision

4) If you need to check what models are actually available, run:
   `node scripts/check-models.js`

**Note:** The extension automatically checks for stale snapshots on startup and before coding sessions. This command forces a refresh regardless of freshness.

Then proceed with my coding request.

