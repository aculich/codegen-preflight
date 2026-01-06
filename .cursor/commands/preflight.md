# Preflight: refresh versions + model catalog

Run this command to force refresh the snapshot and get the latest model information.

## Steps

1. **Execute the preflight script:**
   ```bash
   npm run preflight
   ```
   Wait for it to complete. This generates a fresh snapshot and updates `.cursor/rules/01-version-snapshot.mdc`.

2. **Read the generated snapshot file:**
   Open `.cursor/rules/01-version-snapshot.mdc` and verify:
   - It has today's timestamp
   - It includes latest SDK versions
   - It lists selected default models with release dates
   - It includes provenance information

3. **Report the findings:**
   - What changed since the last snapshot (if any)
   - Model IDs and release dates for: reasoning, fast, vision, image generation
   - Any deprecated models that should be avoided

4. **If needed, check models directly:**
   ```bash
   node scripts/check-models.js
   ```

**Note:** This command forces a refresh regardless of freshness. The extension also auto-checks on startup.

