# Project Map

## Project

spark-tutor

## Short description

A RAG-based AI chat system for a training and education center.

## Core features

1. Socratic tutoring
2. Teacher-support questions
3. Exercise generation and solution verification
4. Direct teaching of a topic

## Expected repository structure

```txt
/
  frontend/
    src/
      components/
      pages/
      api/
      state/
      styles/
  backend/
    retriever/
      app/
        auth/
        users/
        chats/
        ai_workflows/
        rag/
        attachments/
        settings/
        db/
    embedder/
      app/
        ingestion/
        chunking/
        embeddings/
        documents/
        db/
  shared/
    prompts/
    schemas/
  docker/
  specs/
  AGENTS.md
  AI_CONTRACT.md
  ARCHITECTURE.md
  projectmap.md
  DECISIONS.md
  README.md
  CONTRIBUTIONS.md
  CHANGELOG.md
  LICENSE.md
  docker-compose.yml
```

## Domain map

### Frontend

Location:
```txt
frontend/
```

Owns:

* UI components
* Pages
* API client calls
* Frontend state
* Form validation for user experience
* Corporate design implementation

Must not own:

* Auth decisions
* RAG filtering
* Workflow routing
* Prompt templates
* Business rules

### Retriever backend

Location:
```txt
backend/retriever/
```

Owns:

* User-facing API
* Auth/session handling
* Chats
* Messages
* User settings
* Attachment handling
* AI workflow routing
* Prompt building
* RAG retrieval
* Chat LLM calls

### Embedder backend

Location:
```txt
backend/embedder/
```

Owns:

* Admin-only ingestion
* Document parsing
* Chunking
* Embedding generation
* Document and chunk tagging

### Shared prompts and schemas

Location:
```txt
shared/
```

Owns:

* Shared prompt templates
* Shared DTO/schema definitions where useful
* Workflow names and constants

## Important workflows

User prompt workflow
```txt
Frontend chat input
  -> POST user prompt
  -> Retriever backend
  -> Validate auth
  -> Load chat history
  -> Load user settings
  -> Load training/class ID
  -> Classify workflow
  -> Retrieve RAG context
  -> Build workflow prompt
  -> Call chat LLM
  -> Persist response
  -> Return response
```

Admin ingestion workflow
```txt
Admin uploads/ingests source material
  -> Embedder backend
  -> Parse document
  -> Split into chunks
  -> Attach training/class tags
  -> Generate embeddings
  -> Store chunks and vectors in PostgreSQL
```

## Change location guide

| Change type | Location |
| ----------- | -------- |
| Login/logout/password change | backend/retriever/app/auth/ and frontend/src/pages/ |
| User settings | backend/retriever/app/settings/ and frontend settings UI |
| Chat persistence | backend/retriever/app/chats/ |
| Workflow routing | backend/retriever/app/ai_workflows/ |
| Prompt templates | shared/prompts/ |
| RAG retrieval | backend/retriever/app/rag/ |
| Embedding ingestion | backend/embedder/app/ |
| File attachments | backend/retriever/app/attachments/ |
| Corporate design | frontend/src/styles/ and UI components |
| Docker topology | docker-compose.yml, docker/, README.md, ARCHITECTURE.md |

## Current open assumptions

* Exact folder structure is not final yet.
* Exact LLM models are not fixed yet.
* Exact vector extension is not named yet.
* Exact auth/session mechanism is not fixed yet.
* Corporate design files will be added later.
* License type is not finalized.