# After Action Review (AAR) Process

This directory contains After Action Reviews (AARs) for significant events, incidents, releases, and major decisions in the Codegen Preflight project.

## What is an AAR?

An After Action Review (AAR) is a structured process for learning from events, both positive and negative. AARs help us:

- Understand what happened and why
- Identify what went well and what didn't
- Learn from mistakes and successes
- Prevent recurrence of problems
- Share knowledge across the team
- Improve processes and systems

## When to Conduct an AAR

Conduct an AAR after:

- **Incidents**: Production issues, security incidents, data loss, service outages
- **Releases**: Major version releases, significant feature launches
- **Major Decisions**: Architectural changes, technology choices, process changes
- **Process Failures**: When established processes break down
- **Significant Events**: Any event that impacts users, development velocity, or team morale

**Not every event needs an AAR**. Use judgment to determine if an event is significant enough to warrant the time investment.

## Who Should Participate

**Required Participants**:
- Primary actors (people directly involved in the event)
- Decision makers (people who made key decisions)
- Observers (people who witnessed the event)

**Optional Participants**:
- Team leads
- Stakeholders
- Future team members (for knowledge sharing)

**Facilitator**: Someone neutral who can guide the discussion objectively.

## How to Conduct an AAR

### 1. Schedule the Review

- **Timing**: Within 1-3 days of the event (while memories are fresh)
- **Duration**: 30-60 minutes for most events
- **Format**: In-person, video call, or async (document-based)

### 2. Prepare

- Gather relevant data (logs, metrics, timelines)
- Review related documentation
- Prepare the AAR template
- Set ground rules (blameless, focus on learning)

### 3. Conduct the Review

Follow the AAR template structure:

1. **Event Summary** - What happened?
2. **Timeline** - When did it occur?
3. **Impact** - What was affected?
4. **Root Cause Analysis** - Why did it happen?
5. **What Went Well** - Positive aspects
6. **What Went Wrong** - Issues encountered
7. **Action Items** - Specific fixes and improvements
8. **Prevention Measures** - How to avoid recurrence
9. **Feed Forward** - Lessons for future projects

### 4. Document

- Use the [AAR template](template.md)
- Be specific and factual
- Focus on systems and processes, not individuals
- Include actionable items with owners and deadlines

### 5. Follow Up

- Track action items to completion
- Review AAR after 30 days to verify improvements
- Share learnings with the broader team
- Update project templates and documentation

## Integration with ADRs

AARs and Architecture Decision Records (ADRs) are complementary:

- **AARs** document "what happened" and "what we learned"
- **ADRs** document "why we decided" and "what we chose"

**Connections**:
- AARs can lead to new ADRs (e.g., "We learned X, so we decided Y")
- ADRs can reference AARs for context (e.g., "This decision was informed by AAR-0001")
- Both preserve institutional knowledge
- Both help with future project planning

## Naming Convention

AAR files follow this pattern:
- `docs/aar/0001-<event-name>.md`
- Use sequential numbering (0001, 0002, 0003, ...)
- Use kebab-case for event names
- Examples:
  - `0001-workflow-permissions-issue.md`
  - `0002-v0-1-0-release.md`
  - `0003-build-failure-incident.md`

## Review Schedule

- **Immediate**: Within 1-3 days of event
- **30-day follow-up**: Review action items and verify improvements
- **Quarterly**: Review all AARs to identify patterns and systemic issues

## Best Practices

1. **Blameless Culture**: Focus on systems and processes, not individuals
2. **Be Specific**: Use concrete examples and data
3. **Actionable**: Every issue should have a corresponding action item
4. **Timely**: Conduct reviews while memories are fresh
5. **Inclusive**: Include all relevant perspectives
6. **Documented**: Write down findings for future reference
7. **Followed Up**: Track action items to completion

## Automation Opportunities

Potential automation:

- AAR template generator (similar to ADR tooling)
- Checklist generator from AARs
- Feed forward document generator
- Integration with issue tracking
- Automated AAR reminders after releases/incidents

## References

- [Architecture Decision Records (ADRs)](../adr/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Postmortem Best Practices](https://github.com/danluu/post-mortems)

---

*For questions or suggestions about the AAR process, please open an issue or discussion.*
