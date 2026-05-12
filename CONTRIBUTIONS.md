# Contributions

## Project workflow

spark-tutor uses small, reviewable changes.

Before implementing a change:

1. Read `AGENTS.md`
2. Read `AI_CONTRACT.md`
3. Read `ARCHITECTURE.md`
4. Read `projectmap.md`
5. Read or create the relevant spec in `specs/`

## Branch naming

Use descriptive branch names:

```txt
feature/chat-workflow-router
fix/rag-class-filter
docs/update-architecture
refactor/prompt-builder
```

## Commit convention

Use Conventional Commits:
```txt
feat: add workflow router
fix: enforce class filter in retrieval
docs: update architecture
test: add chat ownership tests
refactor: split prompt builders
chore: update docker compose
```

Breaking changes must use:
```txt
feat!: change chat API response format
```

or include:
```txt
BREAKING CHANGE: description
```

## Pull request requirements

Every pull request must include:

* Summary
* Motivation
* Files changed
* Tests added or updated
* Commands run
* Screenshots for UI changes
* Documentation updates if needed
* Security/access-control impact if applicable

## Required checks

Before requesting review, run applicable checks:
```bash
docker compose config
docker compose build
npm test
npm run lint
npm run typecheck
pytest
```

## AI-assisted coding rules

AI-generated changes must follow AI_CONTRACT.md.

Do not accept AI output that:

* Hardcodes examples
* Bypasses RAG filtering
* Places business logic in UI
* Changes auth behavior without tests
* Adds prompts without documenting workflow behavior
* Touches Docker topology without documentation updates

## Changelog

All notable changes must appear in CHANGELOG.md.

The preferred process is automatic changelog generation from Conventional Commits during release.

## Documentation

Update documentation when changing:

* Architecture
* Service boundaries
* Docker setup
* Auth behavior
* RAG filtering
* Prompt workflows
* User-facing behavior
* Admin ingestion behavior