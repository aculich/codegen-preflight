You’re pointing at a very specific (and very real) product gap:

## The problem (crisp articulation)

**Agentic coding IDEs routinely generate “wrong-on-day-one” code because they start coding without a current “world-state” snapshot.** That snapshot needs to include:

1. **Your repo state** (what’s pinned in `uv.lock`, `package-lock.json`, etc.)
2. **The outside world state** (latest SDK releases + which model IDs exist *today* for the providers you’re using)
3. **A target policy** (what “best default” means for *this* project: fast vs. reasoning vs. vision vs. cost)

When that snapshot is missing, the model fills the vacuum with stale priors → you get “ancient model IDs”, deprecated SDK patterns, or incorrect client code.

Your attached plan files show the failure mode perfectly:

* The plan explicitly says **Gemini 3 is “not yet available as of Jan 2026”**  (but Gemini 3 was announced/released in Nov 2025) ([blog.google][1]).
* It pins **google-genai “v1.33.0+”** , but PyPI shows **google-genai 1.56.0 uploaded Dec 17, 2025** ([PyPI][2]).
* It uses an OpenAI-style `chat.completions.create()` call while passing a Gemini model string in TypeScript  — that only makes sense if you’re routing through something OpenAI-compatible (LiteLLM proxy etc.), not the native Gemini SDK.

So yes: **this should be “solved” by the IDE doing preflight.**

---

## “State of the world” today (Jan 5, 2026) — with how to verify it

### Google (Gemini)

* **Gemini 3** is publicly announced/released (Nov 18, 2025). ([blog.google][1])
* Gemini has an actual **Models API** you can query to list models: `GET https://generativelanguage.googleapis.com/v1beta/models` ([Google AI for Developers][3])
* The modern Python SDK is **google-genai** and Google explicitly warns that models will generate outdated code and provides **“Code Generation instructions”** for LLMs in the repo. ([GitHub][4])
* **google-generativeai** is legacy and support ended **Nov 30, 2025**. ([PyPI][5])

### Anthropic (Claude)

* Anthropic has a **List Models** endpoint: `GET /v1/models`. ([Claude Docs][6])
* Their model overview lists **Claude Opus 4.1** with canonical ID `claude-opus-4-1-20250805` (and more). ([Claude Docs][7])

### OpenAI

* OpenAI’s current model line includes **GPT-5.2** model IDs/snapshots (see the official docs page for the canonical names).
* OpenAI Node and Python SDKs are actively updated (Node package page shows a very recent publish cadence).

**Key point:** you’re right that **there *is* a “good default” answer on a given date**—and the IDE should fetch it automatically. The *availability-per-key* nuance still exists, but it’s not an excuse for the IDE to do *zero* preflight.

---

## Do tools already exist so you don’t have to write everything?

### 1) LiteLLM (useful, but not the whole solution)

**LiteLLM** is the closest “already exists” piece for *runtime* routing:

* It normalizes many providers behind an OpenAI-compatible interface and supports **routing/fallbacks/aliases** (so you can define “best” → concrete model).

But LiteLLM doesn’t magically inject “today’s world-state” into Cursor *before* the IDE starts generating. It helps you at runtime and can centralize model selection—great—but you still want **preflight + context injection** at codegen-time.

### 2) LightLLM (not what you want)

**LightLLM** is about high-performance inference serving for OSS-style deployments, not “keep me current on SaaS model IDs + SDKs inside Cursor.”

### 3) MCP servers for “latest package versions”

There are MCP servers specifically to let agents query registries:

* **Versionator MCP** (multi-ecosystem version lookups)
* “Package Version Checker” MCP-type servers exist too

These are helpful, but by default they’re **tool calls during agent work**, not a guaranteed “preflight snapshot injected into every prompt.” You can *make* it behave that way with Cursor Rules + a preflight command.

---

## How to tell Cursor (Rules vs. MCP vs. Commands)

Cursor gives you 3 primitives you can combine:

1. **Project Rules** (`.cursor/rules/*.mdc`) to *force behavior* (always apply instructions).
2. **Custom Commands** (`.cursor/commands/*.md`) so you can run a standardized `/preflight` workflow.
3. **MCP** to provide tools/resources to the Agent (Composer).

The best pattern in practice is:

> **Generate an always-apply “Version Snapshot Rule” file** (auto-updated) + have a `/preflight` command that refreshes it.

That way, **every codegen prompt starts with fresh versions** because the snapshot is part of the system/rules context, not something the model has to “remember to ask for.”

---

# The solution (architecture)

## “Version Preflight Context Engineering” pipeline

**Inputs**

* Repo: `uv.lock`, `pyproject.toml`, `package.json`, `package-lock.json` (and optionally `Cargo.lock`)
* Registries: PyPI + npm (latest versions)
* Providers: OpenAI `/v1/models`, Anthropic `/v1/models`, Gemini `v1beta/models`

**Outputs**

1. `version_snapshot.json` (machine-readable)
2. `.cursor/rules/01-version-snapshot.mdc` (alwaysApply: true) — **the “world state” injected into Cursor**
3. A deterministic **model policy** (“best reasoning”, “best fast”, “best vision”) derived from discovered catalogs

**Workflow**

* You run `/preflight` at the start of a coding session (or anytime you suspect drift).
* The agent runs a script that updates the snapshot rule file.
* All subsequent codegen is constrained by that rule.

---

# Rage-post (polite, snarky, call-to-action)

### Title: “It’s January 2026. Why am I still babysitting model IDs?”

It’s January 2026, and my AI coding IDE can:

* refactor entire subsystems,
* write tests,
* reason about architecture…

…but it still starts “greenfield” coding sessions with **zero awareness of today’s APIs**.

So I get code targeting:

* deprecated SDKs,
* model names that don’t exist anymore,
* or “ancient” default models that quietly sabotage quality.

And yes, I can pin versions. I *do* pin versions. That’s not the point.

The point is: when I open a fresh repo and say “build it,” the IDE should run a **version preflight** the same way compilers run sanity checks:

* “Here are the latest SDKs.”
* “Here are the provider model IDs that exist today.”
* “Here’s what your repo is currently pinned to.”
* “Here’s the drift and the recommended default target.”

Instead, we’re all doing the same tribal workaround:
copy/paste docs, sprinkle prompts, run Renovate later, and hope the agent doesn’t invent a model called “Nano Banana Pro 3” again.

Google literally ships “codegen instructions” in their SDK repo because LLMs hallucinate stale patterns.
That’s a sign the industry knows the problem—yet the IDE experience still treats freshness like an optional side quest.

This should be a first-class feature: **“Start Session → Preflight → Code.”**
If the IDE can run agent terminal commands and MCP tools, it can do this. We shouldn’t be rebuilding “version awareness” in every repo like it’s 2016.

---

# Implementation: v1 you can drop into your repo today

Below is a **minimal, practical** first version for Python + Node that:

* reads pinned deps from `uv.lock` + `package-lock.json` (best-effort),
* fetches latest versions from PyPI + npm,
* (optionally) lists available models from OpenAI/Anthropic/Gemini if API keys are present,
* writes an **always-apply Cursor Rule** containing the snapshot.

## 1) `scripts/version_preflight.py`

````python
#!/usr/bin/env python3
"""
Version preflight for agentic codegen.

Outputs:
- version_snapshot.json (machine-readable)
- .cursor/rules/01-version-snapshot.mdc (alwaysApply Cursor rule, injected into every prompt)
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import urllib.request
from dataclasses import dataclass
from pathlib import Path

try:
    import tomllib  # py3.11+
except ImportError:  # pragma: no cover
    print("ERROR: Python 3.11+ required (tomllib).", file=sys.stderr)
    sys.exit(2)


ROOT = Path(__file__).resolve().parents[1]
CURSOR_RULES_DIR = ROOT / ".cursor" / "rules"
SNAPSHOT_RULE_PATH = CURSOR_RULES_DIR / "01-version-snapshot.mdc"
SNAPSHOT_JSON_PATH = ROOT / "version_snapshot.json"


def _http_json(url: str, headers: dict[str, str] | None = None, timeout_s: int = 15) -> dict:
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=timeout_s) as resp:
        return json.loads(resp.read().decode("utf-8"))


def latest_pypi(pkg: str) -> str | None:
    try:
        data = _http_json(f"https://pypi.org/pypi/{pkg}/json")
        return data.get("info", {}).get("version")
    except Exception:
        return None


def latest_npm(pkg: str) -> str | None:
    # npm registry JSON returns dist-tags.latest
    try:
        data = _http_json(f"https://registry.npmjs.org/{pkg}")
        return (data.get("dist-tags") or {}).get("latest")
    except Exception:
        return None


def read_uv_lock_versions(uv_lock: Path) -> dict[str, str]:
    """
    Best-effort parse uv.lock (TOML). We pull top-level [[package]] name/version.
    """
    versions: dict[str, str] = {}
    try:
        doc = tomllib.loads(uv_lock.read_text("utf-8"))
        pkgs = doc.get("package", [])
        if isinstance(pkgs, list):
            for p in pkgs:
                name = p.get("name")
                ver = p.get("version")
                if isinstance(name, str) and isinstance(ver, str):
                    versions[name] = ver
    except Exception:
        pass
    return versions


def read_package_lock_versions(lock_path: Path) -> dict[str, str]:
    """
    Best-effort parse package-lock.json (npm).
    """
    versions: dict[str, str] = {}
    try:
        doc = json.loads(lock_path.read_text("utf-8"))
        # npm v7+ lock has "packages": { "node_modules/x": { "version": "..." } }
        packages = doc.get("packages", {})
        if isinstance(packages, dict):
            for k, v in packages.items():
                if not isinstance(k, str) or not isinstance(v, dict):
                    continue
                if not k.startswith("node_modules/"):
                    continue
                name = k[len("node_modules/") :]
                ver = v.get("version")
                if isinstance(name, str) and isinstance(ver, str):
                    versions[name] = ver
    except Exception:
        pass
    return versions


@dataclass(frozen=True)
class ModelInfo:
    provider: str
    model_id: str
    display: str | None = None


def list_openai_models() -> list[ModelInfo]:
    key = os.getenv("OPENAI_API_KEY")
    if not key:
        return []
    base = os.getenv("OPENAI_BASE_URL", "https://api.openai.com").rstrip("/")
    try:
        data = _http_json(f"{base}/v1/models", headers={"Authorization": f"Bearer {key}"})
        out: list[ModelInfo] = []
        for m in data.get("data", []):
            mid = m.get("id")
            if isinstance(mid, str):
                out.append(ModelInfo("openai", mid, None))
        return out
    except Exception:
        return []


def list_anthropic_models() -> list[ModelInfo]:
    key = os.getenv("ANTHROPIC_API_KEY")
    if not key:
        return []
    try:
        data = _http_json(
            "https://api.anthropic.com/v1/models",
            headers={
                "x-api-key": key,
                "anthropic-version": "2023-06-01",
            },
        )
        out: list[ModelInfo] = []
        for m in data.get("data", []):
            mid = m.get("id")
            disp = m.get("display_name")
            if isinstance(mid, str):
                out.append(ModelInfo("anthropic", mid, disp if isinstance(disp, str) else None))
        return out
    except Exception:
        return []


def list_gemini_models() -> list[ModelInfo]:
    """
    Gemini API models list endpoint:
      GET https://generativelanguage.googleapis.com/v1beta/models
    Auth via x-goog-api-key header.
    """
    key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not key:
        return []
    try:
        data = _http_json(
            "https://generativelanguage.googleapis.com/v1beta/models",
            headers={"x-goog-api-key": key},
        )
        out: list[ModelInfo] = []
        for m in data.get("models", []):
            name = m.get("name")  # often "models/gemini-..."
            disp = m.get("displayName")
            if isinstance(name, str):
                mid = name.replace("models/", "")
                out.append(ModelInfo("google", mid, disp if isinstance(disp, str) else None))
        return out
    except Exception:
        return []


def pick_best(models: list[ModelInfo], provider: str, patterns: list[str]) -> str | None:
    """
    Deterministic selection: filter provider, then first regex match in order.
    """
    provider_models = [m.model_id for m in models if m.provider == provider]
    for pat in patterns:
        rx = re.compile(pat)
        matches = sorted([mid for mid in provider_models if rx.search(mid)])
        if matches:
            return matches[0]
    return None


def main() -> int:
    ts = int(time.time())

    uv_versions = read_uv_lock_versions(ROOT / "uv.lock") if (ROOT / "uv.lock").exists() else {}
    npm_versions = read_package_lock_versions(ROOT / "package-lock.json") if (ROOT / "package-lock.json").exists() else {}

    # Choose a small curated set to always check "latest" for (add your stack here)
    watch_pypi = sorted(set([k.lower() for k in ("openai", "anthropic", "google-genai", "litellm")]))
    watch_npm = sorted(set([k for k in ("openai", "@anthropic-ai/sdk", "@google/genai")]))  # add more as needed

    pypi_latest = {p: latest_pypi(p) for p in watch_pypi}
    npm_latest = {p: latest_npm(p) for p in watch_npm}

    models = []
    models += list_openai_models()
    models += list_anthropic_models()
    models += list_gemini_models()

    # Simple deterministic policy (edit to taste)
    selected = {
        "reasoning": {
            "openai": pick_best(models, "openai", [r"^gpt-5\.2.*thinking", r"^gpt-5\.2", r"^gpt-5"]),
            "anthropic": pick_best(models, "anthropic", [r"^claude-opus-4-1-", r"^claude-opus-4-"]),
            "google": pick_best(models, "google", [r"^gemini-3-pro", r"^gemini-3", r"^gemini-2\.5-pro"]),
        },
        "fast": {
            "openai": pick_best(models, "openai", [r"^gpt-5\.2.*instant", r"^gpt-5.*mini", r"^gpt-4\.1-mini"]),
            "anthropic": pick_best(models, "anthropic", [r"^claude-sonnet-4-", r"^claude-3-5-sonnet-"]),
            "google": pick_best(models, "google", [r"^gemini-3-flash", r"^gemini-2\.5-flash"]),
        },
        "vision": {
            "openai": pick_best(models, "openai", [r"^gpt-5\.2", r"^gpt-4\.1"]),
            "anthropic": pick_best(models, "anthropic", [r"^claude-opus-4-1-", r"^claude-sonnet-4-"]),
            "google": pick_best(models, "google", [r"^nano-banana-pro", r"^gemini-3-pro", r"^gemini-2\.5-pro"]),
        },
    }

    snapshot = {
        "generated_at_unix": ts,
        "generated_at_iso": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(ts)),
        "repo": {"root": str(ROOT)},
        "deps": {
            "python_pinned_from_uv_lock": uv_versions,
            "npm_pinned_from_package_lock": npm_versions,
            "pypi_latest": pypi_latest,
            "npm_latest": npm_latest,
        },
        "models": {
            "discovered": [m.__dict__ for m in models],
            "selected": selected,
        },
        "notes": [
            "If models.discovered is empty, set OPENAI_API_KEY / ANTHROPIC_API_KEY / GEMINI_API_KEY then rerun.",
            "This file is meant to be injected into Cursor via an always-apply rule.",
        ],
    }

    SNAPSHOT_JSON_PATH.write_text(json.dumps(snapshot, indent=2, sort_keys=True), "utf-8")

    CURSOR_RULES_DIR.mkdir(parents=True, exist_ok=True)
    rule = f"""---
alwaysApply: true
description: "AUTO-GENERATED: Version + model snapshot. Run /preflight to refresh."
---

# Version & Model Snapshot (AUTO-GENERATED)

Generated: {snapshot["generated_at_iso"]}

## Selected default models (deterministic)
```json
{json.dumps(selected, indent=2, sort_keys=True)}
````

## SDK latest versions (registry)

### PyPI

```json
{json.dumps(pypi_latest, indent=2, sort_keys=True)}
```

### npm

```json
{json.dumps(npm_latest, indent=2, sort_keys=True)}
```

## Repo pinned versions (best-effort)

### uv.lock

Pinned packages found: {len(uv_versions)}

### package-lock.json

Pinned packages found: {len(npm_versions)}

## Rules for codegen

* Use the *Selected default models* unless the user explicitly pins something else.
* When writing provider code, use *canonical discovered model IDs* (or these selections).
* When writing install snippets, prefer the *latest versions* above unless repo policy pins older versions.
  """
  SNAPSHOT_RULE_PATH.write_text(rule, "utf-8")

  print(f"Wrote {SNAPSHOT_JSON_PATH.relative_to(ROOT)}")
  print(f"Wrote {SNAPSHOT_RULE_PATH.relative_to(ROOT)}")
  return 0

if **name** == "**main**":
raise SystemExit(main())

````

Why this matches your goal:
- It **creates an always-on Cursor Rule** that becomes the “world-state context” for every generation.
- It supports the exact provider model listing endpoints you want (Gemini models list , Anthropic models list , OpenAI models list ).

## 2) Stable rule: `.cursor/rules/00-version-preflight.mdc`

```md
---
alwaysApply: true
description: "Policy: always use the auto-generated version/model snapshot for codegen."
---

# Codegen Freshness Policy

Before generating code, you MUST follow `.cursor/rules/01-version-snapshot.mdc`.

If the snapshot is older than 24 hours or missing:
1) Ask the user to run `/preflight` (preferred), OR
2) If you are in Agent mode and have terminal access, run:
   `python scripts/version_preflight.py`
Then continue.

Never invent model IDs. Prefer discovered IDs or the selected defaults in the snapshot.
Never recommend deprecated SDKs if the snapshot indicates replacements.
````

## 3) Cursor command: `.cursor/commands/preflight.md`

Cursor commands are just markdown workflows stored in `.cursor/commands`.

```md
# Preflight: refresh versions + model catalog

You are the Cursor Agent. Do this in order:

1) In the terminal, run:
   - `python scripts/version_preflight.py`

2) Open `.cursor/rules/01-version-snapshot.mdc` and confirm:
   - It has today's timestamp
   - It lists latest SDK versions
   - It lists selected default models

3) Tell me what changed since the last snapshot (if any), and what model IDs you will use for:
   - reasoning
   - fast
   - vision

Then proceed with my coding request.
```

## 4) Optional: MCP (nice upgrade, not required)

If you want the Agent to be able to query versions via tools, Cursor supports MCP servers and config via `.cursor/mcp.json` or global config.
And MCP Resources support landed (so servers can provide context blobs).

If you’d rather not write any registry-query code yourself, look at **Versionator MCP** (multi-ecosystem).

(You can also follow quick “build your own MCP tool in Cursor” tutorials if you want this to be a first-class tool in your setup.)

---

# Renovate config (uv + npm) + GitHub Actions (still useful for drift)

Even though you correctly said “CI is too late for codegen,” you still want it to prevent silent rot.

## Renovate: `renovate.json`

Renovate supports **uv** (`uv.lock`) and PEP 621 dependencies in `pyproject.toml`.

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended"],
  "lockFileMaintenance": { "enabled": true },
  "packageRules": [
    {
      "matchManagers": ["pep621", "uv"],
      "groupName": "python deps (uv)",
      "rangeStrategy": "auto"
    },
    {
      "matchManagers": ["npm"],
      "groupName": "js deps (npm)",
      "rangeStrategy": "auto"
    }
  ]
}
```

## GitHub Action: verify lockfile freshness

uv won’t update lockfiles automatically just because new versions exist; you check with `uv lock --check`.

```yaml
name: deps-lockfile-check
on:
  pull_request:
  workflow_dispatch:

jobs:
  uv-lock-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v4
      - run: uv lock --check

  npm-lock-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
```

---

# What you asked about specifically: “isn’t there a codegen preflight planning tool?”

Pieces exist, but nobody has glued them into the IDE by default:

* Google literally publishes “codegen instructions” to keep LLM outputs current for their SDK.
* Cursor gives you the primitives: **Rules**, **Commands**, **MCP**, and MCP Resources.
* LiteLLM gives you runtime routing and a normalized model interface.

What’s missing (today) is the **opinionated “session start = preflight” productization** inside the IDE.

---

## If you want, I can tailor the “selected model policy” to your exact preferences

But you don’t need to wait for that to get value: drop in the script + Cursor rules + `/preflight` command and you’ll stop seeing “ancient model IDs” in greenfield codegen immediately.

[1]: https://blog.google/products/gemini/gemini-3/?utm_source=chatgpt.com "Gemini 3: Introducing the latest Gemini AI model from Google"
[2]: https://pypi.org/project/google-genai/?utm_source=chatgpt.com "google-genai · PyPI"
[3]: https://ai.google.dev/api/rest/generativelanguage/models?utm_source=chatgpt.com "Models  |  Gemini API  |  Google AI for Developers"
[4]: https://github.com/googleapis/python-genai?utm_source=chatgpt.com "GitHub - googleapis/python-genai: Google Gen AI Python SDK provides an interface for developers to integrate Google's generative models into their Python applications."
[5]: https://pypi.org/project/google-generativeai/?utm_source=chatgpt.com "google-generativeai · PyPI"
[6]: https://docs.anthropic.com/en/api/models-list?utm_source=chatgpt.com "List Models - Anthropic"
[7]: https://docs.anthropic.com/en/docs/about-claude/models/all-models?utm_source=chatgpt.com "Models overview - Anthropic"
