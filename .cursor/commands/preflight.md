# Preflight: refresh versions + model catalog

Execute `npm run preflight` in the terminal to force refresh the snapshot.

After completion, read `.cursor/rules/01-version-snapshot.mdc` and report:
- Latest SDK versions (npm and PyPI)
- Selected default models with release dates for: reasoning, fast, vision, image generation
- Total models discovered and breakdown by type
- Any deprecated models to avoid

Then proceed with the user's request.

