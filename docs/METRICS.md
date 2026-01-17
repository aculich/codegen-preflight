# Adoption Metrics and Monitoring

This document outlines the metrics we track to measure adoption and success of the Codegen Preflight extension.

## Overview

We track both quantitative metrics (stars, forks, clones) and qualitative signals (issues, discussions, usage patterns) to understand how the project is being adopted and where improvements are needed.

## Primary Metrics

### GitHub Repository Metrics

**Stars** (`stargazers_count`)
- **What it measures**: Interest and awareness
- **Target**: 
  - Week 1: 5-10 stars
  - Month 1: 20+ stars
  - Month 3: 50+ stars
- **How to check**: 
  - GitHub API: `GET /repos/{owner}/{repo}`
  - GitHub Insights dashboard
  - Repository page

**Forks** (`forks_count`)
- **What it measures**: Developer engagement and potential contributions
- **Target**:
  - Week 1: 1-3 forks
  - Month 1: 3+ forks
  - Month 3: 10+ forks
- **How to check**: Same as stars

**Clones** (Traffic API)
- **What it measures**: Actual usage and installation attempts
- **Target**:
  - Week 1: 10-50 clones
  - Month 1: 50+ clones
  - Month 3: 200+ clones
- **Limitations**: Only available for last 14 days, only to repo owners
- **How to check**: 
  - GitHub API: `GET /repos/{owner}/{repo}/traffic/clones`
  - GitHub Insights → Traffic tab

**Views** (Traffic API)
- **What it measures**: Repository page visits
- **Target**: Track trends over time
- **Limitations**: Only available for last 14 days
- **How to check**: 
  - GitHub API: `GET /repos/{owner}/{repo}/traffic/views`
  - GitHub Insights → Traffic tab

### Extension-Specific Metrics

**VSIX Downloads**
- **What it measures**: Extension adoption
- **How to check**: GitHub Release page download counts
- **Target**: Track downloads per release

**Extension Installs** (Future - when on marketplace)
- **What it measures**: Active users
- **How to check**: VS Code Marketplace statistics
- **Target**: Track installs and active users

## Secondary Metrics

### Engagement Metrics

**Issues Opened**
- **What it measures**: User engagement and problem discovery
- **Target**: Healthy issue discussion (not too many critical bugs)
- **How to check**: GitHub API or Issues page

**Pull Requests**
- **What it measures**: Community contributions
- **Target**: Increasing PRs over time
- **How to check**: GitHub API or Pull Requests page

**Discussions**
- **What it measures**: Community engagement
- **Target**: Active discussions about features and usage
- **How to check**: GitHub Discussions page

### Quality Metrics

**Issue Resolution Time**
- **What it measures**: Responsiveness and project health
- **Target**: Respond within 48 hours, resolve within 1 week for bugs

**Test Coverage** (Future)
- **What it measures**: Code quality and maintainability
- **Target**: >80% coverage

## Monitoring Tools

### Automated Collection

We use a GitHub Actions workflow (`.github/workflows/metrics.yml`) that:
- Runs daily at 00:00 UTC
- Collects stars, forks, clones, views, and issues
- Stores metrics in `metrics/stats.json`
- Commits metrics to the repository for historical tracking

**View Metrics**:
```bash
cat metrics/stats.json
```

### Manual Monitoring

**GitHub Insights Dashboard**:
- Visit: `https://github.com/aculich/codegen-preflight/insights`
- Check "Traffic" tab for clones and views
- Check "Community" tab for overall health

**GitHub API**:
```bash
# Get repository stats
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/aculich/codegen-preflight

# Get clones (last 14 days)
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/aculich/codegen-preflight/traffic/clones
```

## Success Thresholds

### Week 1 Targets

- ✅ 5+ stars
- ✅ 1+ fork
- ✅ 10+ clones
- ✅ 0 critical issues
- ✅ At least 1 positive user feedback

### Month 1 Targets

- ✅ 20+ stars
- ✅ 3+ forks
- ✅ 50+ clones
- ✅ Active issue discussions
- ✅ At least 1 community contribution (PR or issue)

### Month 3 Targets

- ✅ 50+ stars
- ✅ 10+ forks
- ✅ 200+ clones
- ✅ Regular community engagement
- ✅ Multiple community contributions

## Early Warning Signs

Watch for these red flags:

1. **0 stars after 48 hours**
   - **Action**: Review marketing/discovery strategy
   - **Check**: README clarity, project description, tags

2. **0 clones after 1 week**
   - **Action**: Review installation instructions
   - **Check**: Documentation clarity, setup complexity

3. **Multiple critical issues**
   - **Action**: Prioritize bug fixes
   - **Check**: Test coverage, release process

4. **No engagement after 2 weeks**
   - **Action**: Reach out to early users
   - **Check**: User experience, feature completeness

## Metrics Dashboard (Future)

We plan to create a simple dashboard showing:
- Historical trends (stars, forks, clones over time)
- Growth rate
- Engagement metrics
- Quality metrics

This could be:
- A simple HTML page in `docs/metrics-dashboard.html`
- A GitHub Pages site
- An external dashboard service

## Privacy and Ethics

- We only track public GitHub metrics
- No user tracking or analytics in the extension itself
- All metrics are aggregated and anonymous
- We respect user privacy

## References

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [GitHub Traffic API](https://docs.github.com/en/rest/metrics/traffic)
- [GitHub Insights](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository)

---

*Last updated: 2026-01-17*
