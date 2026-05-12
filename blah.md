# Best prompt to start a serious Codex task:

Read AGENTS.md, AI_CONTRACT.md, ARCHITECTURE.md, projectmap.md, and specs/[feature].md first.
Do not edit code yet.
Return:
1. The domain/module that should own this change
2. Files likely affected
3. Risks
4. Anti-hack tests needed
5. A small ordered implementation plan
Wait for approval before implementing.

# Best prompt after implementation:

Review your changes against:
- AI_CONTRACT.md
- ARCHITECTURE.md
- specs/[feature].md
- .codex/review-checklist.md
- .codex/forbidden-patterns.md
Report any violations or risky shortcuts before I review the diff.