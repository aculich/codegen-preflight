# Contributing to Codegen Preflight

Thank you for your interest in contributing to Codegen Preflight! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Fork and Clone** the repository
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Build the Project**:
   ```bash
   npm run build
   ```
4. **Run in Development Mode**:
   - Open the `packages/extension` folder in Cursor/VS Code
   - Press F5 to run the extension in development mode

## Workflow File Permissions

When making changes to CI/CD or workflow files in `.github/workflows/`, your Git credentials must include the `workflow` scope. Without this, GitHub will block updates to workflow definitions.

### Option 1: GitHub CLI (Recommended)

1. Install GitHub CLI if not already installed: `brew install gh` (macOS) or see [GitHub CLI installation](https://cli.github.com/)
2. Authenticate with workflow scope:
   ```bash
   gh auth login --scopes workflow
   ```
3. Follow the prompts to authenticate
4. Your git operations will now use the authenticated session

### Option 2: Personal Access Token (PAT)

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token (classic) with:
   - `workflow` scope (required for workflow files)
   - `repo` scope (if needed for other operations)
3. Configure your git/IDE to use this token:
   - **Git CLI**: 
     ```bash
     git remote set-url origin https://<token>@github.com/aculich/codegen-preflight.git
     ```
   - **IDE**: Update GitHub integration settings to use PAT
4. Clear any cached credentials so the new token is used:
   - macOS: Keychain Access
   - Windows: Credential Manager
   - Linux: `git credential-cache exit`

### Option 3: Manual Creation

- Create workflow files via GitHub web interface
- Or use GitHub API with proper authentication

### Verifying Permissions

To verify your token has the workflow scope:
- Check token scopes in GitHub settings
- Or test by attempting to push a workflow file change

**Note**: If you encounter the error `refusing to allow an OAuth App to create or update workflow without 'workflow' scope`, you need to use one of the solutions above.

## Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier (configured in the project)
- Write clear, self-documenting code
- Add comments for complex logic

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `refactor:` for code refactoring
- `test:` for test changes
- `chore:` for maintenance tasks

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass: `npm test` (if tests exist)
4. Build successfully: `npm run build`
5. Submit a pull request with a clear description
6. Reference any related issues

## Architecture Decision Records (ADRs)

For significant architectural decisions, create an ADR in `docs/adr/`. See [docs/adr/README.md](docs/adr/) for the ADR process.

## After Action Reviews (AARs)

For significant events, incidents, or releases, create an AAR in `docs/aar/`. See [docs/aar/README.md](docs/aar/) for the AAR process.

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing documentation in `docs/`

Thank you for contributing!
