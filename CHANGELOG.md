# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-01-XX

### Added

- Daily snapshot generation that fetches latest package versions from npm and PyPI
- LLM model discovery from OpenAI, Anthropic, and Gemini APIs
- Deterministic model selection for reasoning, fast, and vision categories
- Automatic Cursor Rules integration - generates `.cursor/rules/01-version-snapshot.mdc` with always-apply policy
- MCP server with tools and resources for version/model queries
- Side panel UI displaying current snapshot state
- Auto-refresh functionality - refreshes snapshot if older than 24 hours on session start
- Command Palette commands:
  - Refresh Snapshot
  - Force Refresh Snapshot
  - Open Preflight Panel
  - Configure API Keys
  - Copy Rule File to Clipboard
  - Generate Global Cursor Config
  - Check Preflight Before Coding
- API key configuration via VS Code settings, Command Palette, or environment variables
- MCP server registration with Cursor
- Snapshot caching in `.codegen-preflight/snapshot.json`
- Support for enhanced features (Repomix, LiteLLM, Context7) via environment variable
- Status bar indicator showing snapshot freshness

### Changed

- Initial release

### Fixed

- Initial release
