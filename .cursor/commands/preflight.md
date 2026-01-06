# Preflight: refresh versions + model catalog

You are the Cursor Agent. Do this in order:

1) **Force refresh the snapshot** (even if one was done today):
   - If the Codegen Preflight extension is installed: Use the "Force Refresh Snapshot" command from the command palette (Cmd+Shift+P → "Codegen Preflight: Force Refresh Snapshot")
   - Otherwise: `npm run preflight` (if available) or manually trigger the snapshot generation

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

