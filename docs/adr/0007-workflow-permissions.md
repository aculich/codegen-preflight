# ADR-0007: Workflow File Permissions and Authentication

## Status

Accepted

## Context

During the v0.1.0 release preparation, we encountered an error when attempting to push changes to `.github/workflows/release.yml`:

```
refusing to allow an OAuth App to create or update workflow '.github/workflows/release.yml' without 'workflow' scope
```

This error occurs because GitHub requires elevated permissions (the `workflow` scope) to modify workflow files, as they can execute arbitrary code in the repository's context. This is a security feature to prevent unauthorized workflow modifications.

Key considerations:
- Workflow files are sensitive (can execute code)
- OAuth Apps have restricted permissions by default
- Personal Access Tokens (PATs) can be configured with specific scopes
- GitHub CLI provides an alternative authentication method
- Multiple solutions exist, each with different tradeoffs

## Decision

We will document workflow file permission requirements and provide multiple solution paths for developers:

1. **Primary Solution: GitHub CLI** (Recommended for developers)
   - Use `gh auth login --scopes workflow` to authenticate with workflow scope
   - Simplest and most user-friendly approach
   - Handles token management automatically

2. **Alternative Solution: Personal Access Token (PAT)**
   - Create PAT with `workflow` scope at https://github.com/settings/tokens
   - Configure git/IDE to use PAT
   - More manual but provides fine-grained control

3. **Fallback Solution: Manual Creation**
   - Create workflow files via GitHub web interface
   - Use GitHub API for programmatic creation
   - Useful when other methods aren't available

**Documentation Strategy**:
- Document in CONTRIBUTING.md with clear instructions
- Add to project setup checklist
- Include in README development section
- Reference in AAR-0001 for context

## Consequences

### Positive

- **Multiple Solutions**: Developers can choose the method that works best for their environment
- **Clear Documentation**: Future developers will know about this requirement upfront
- **Security**: GitHub's permission model prevents unauthorized workflow modifications
- **Flexibility**: Different solutions work for different use cases (CLI, IDE, automation)

### Negative

- **Additional Setup Step**: Developers must configure authentication with workflow scope
- **Potential Confusion**: Multiple solutions might confuse some developers
- **Documentation Maintenance**: Must keep documentation updated as GitHub changes

## Alternatives Considered

### Single Solution Only

**Why not chosen**: Different developers have different preferences and environments. Some prefer CLI, others prefer PATs, and some need manual methods. Providing multiple solutions increases accessibility.

### No Documentation

**Why not chosen**: Without documentation, developers will encounter the same error and waste time researching solutions. Proactive documentation prevents this friction.

### Automated Workflow Creation

**Why not chosen**: While we could create a bootstrap workflow that creates other workflows, this adds complexity and requires initial setup anyway. The manual/documentation approach is simpler for now.

## Implementation

**Files to Update**:
- `CONTRIBUTING.md` - Add "Workflow File Permissions" section
- `README.md` - Reference in development section (already done)
- Project setup checklist - Add verification step

**Content for CONTRIBUTING.md**:

```markdown
## Workflow File Permissions

When making changes to CI/CD or workflow files in `.github/workflows/`, your Git credentials must include the `workflow` scope. Without this, GitHub will block updates to workflow definitions.

### Option 1: GitHub CLI (Recommended)

1. Install GitHub CLI if not already installed
2. Run: `gh auth login --scopes workflow`
3. Follow the prompts to authenticate
4. Your git operations will now use the authenticated session

### Option 2: Personal Access Token (PAT)

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate a new token (classic) with `workflow` scope (and `repo` scope if needed)
3. Configure your git/IDE to use this token:
   - Git: `git remote set-url origin https://<token>@github.com/aculich/codegen-preflight.git`
   - IDE: Update GitHub integration settings to use PAT
4. Clear any cached credentials so the new token is used

### Option 3: Manual Creation

- Create workflow files via GitHub web interface
- Or use GitHub API with proper authentication

### Verifying Permissions

To verify your token has the workflow scope:
- Check token scopes in GitHub settings
- Or test by attempting to push a workflow file change
```

## References

- [AAR-0001: Workflow Permissions Issue](../aar/0001-workflow-permissions-issue.md)
- [GitHub OAuth App Scopes Documentation](https://docs.github.com/en/developers/apps/scopes-for-oauth-apps)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub CLI Authentication](https://cli.github.com/manual/gh_auth_login)
