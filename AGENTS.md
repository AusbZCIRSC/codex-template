# AGENTS.md

## Project

spark-tutor is a RAG-based AI chat system for a training and education center.

The system supports:
1. Socratic tutoring
2. Teacher-support questions
3. Exercise generation and solution verification
4. Direct teaching of a topic

## Required reading before coding

Before changing code, read:

1. `AI_CONTRACT.md`
2. `ARCHITECTURE.md`
3. `projectmap.md`
4. Relevant files in `specs/`
5. `DECISIONS.md` if the change affects architecture, data ownership, deployment, auth, RAG behavior, or AI workflows

## Non-negotiable rules

- Do not implement before understanding the owning domain.
- Do not add one-off fixes for specific prompts, users, classes, files, strings, or examples.
- Do not put business logic in React components.
- Do not bypass class/training-based RAG filtering.
- Do not expose admin-only embedding or ingestion functionality to normal users.
- Do not treat LLM output as trusted.
- Do not persist secrets in the repository.
- Do not make authentication, authorization, or data-isolation changes without tests.
- Do not change Docker topology without updating documentation.

## Core architecture

The intended service split is:

- `frontend`: React + Vite web UI
- `backend/retriever`: FastAPI service used by normal users
- `backend/embedder`: FastAPI/admin-only embedding and ingestion service
- `postgres`: persistent data and vector storage
- `docker-model-runner`: chat LLM and embedding LLM runtime

The retriever backend should eventually serve the built web UI so normal users only need:

- retriever/backend container
- PostgreSQL container
- Docker Model Runner containers

## AI workflow rules

Every user prompt must go through an AI workflow router.

The router must consider:

- Current user prompt
- Relevant chat history
- User settings
- User training/class ID
- Attached files metadata/content where applicable

The router chooses one or more workflows:

- `socratic_tutoring`
- `teacher_questions`
- `exercise_generation_or_verification`
- `topic_teaching`

Each workflow must have its own prompt template and behavior rules.

## RAG rules

RAG retrieval must always be scoped by the authenticated user’s training/class ID.

Content tags must include training/class identifiers.

A user must not retrieve documents from another training/class.

## Auth rules

The first version supports:

- Login
- Logout
- Password change
- No public sign-up

Users are manually created for testing.

Later SSO support must not break the domain model.

## Persistence rules

Persist:

- Users
- User training/class mapping
- User settings
- Chats
- Chat messages
- Attachments metadata
- RAG documents/chunks/embeddings
- AI workflow decisions where useful for debugging and auditability

## Required implementation workflow

For non-trivial changes:

1. Summarize the requested change.
2. Identify the owning domain/module.
3. Identify affected files.
4. Propose the implementation plan.
5. Implement small, reviewable slices.
6. Add or update tests.
7. Update relevant docs.
8. Run verification commands.
9. Report what changed and what was verified.

## Verification commands

Update these once the project has final commands.

```bash
docker compose config
docker compose build
docker compose up
npm test
npm run lint
npm run typecheck
pytest
```

## Completion report format

Every completed task must report:

* Summary
* Files changed
* Why those files were changed
* Tests added or updated
* Commands run
* Risks or follow-up work

## UI / Corporate design rules

Before building UI, read:

1. `specs/design-system.md`
2. `frontend/src/styles/tokens.css`
3. Provided Bundeswehr logo and polygon assets

The UI must follow the Bundeswehr corporate design direction:
- Use Bundeswehr Corporate-Blau as the primary brand color.
- Use Bebas Neue for large headlines if available.
- Use PT Sans for body text if available.
- Use polygon elements carefully and hierarchically.
- Do not recolor or distort logos.
- Do not use TSK/OrgBereich colors unless the content has that organizational assignment.
- Maintain responsive layouts for desktop, tablet, and mobile.