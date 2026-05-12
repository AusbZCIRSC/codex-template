# Feature: Docker Deployment

## Status

Draft

## Goal

Define how spark-tutor is built, run, and shipped with Docker Compose.

## Deployment principle

The project must support two runtime modes:

1. Normal user runtime
2. Admin/ingestion runtime

Normal users must not receive or run embedding/admin ingestion services.

## Compose files

Use separate Compose files:

```txt
compose.yml
compose.admin.yml
compose.prod.yml
```

## compose.yml

Main runtime for normal users and standard development.

Should include:

* PostgreSQL with vector extension
* Retriever backend
* Chat LLM through Docker Model Runner
* Frontend served by retriever backend, or frontend dev server during development

Must not include:

* Embedder service
* Admin ingestion endpoints
* Admin-only volumes
* Admin ingestion jobs

Run with:
```bash
docker compose up --build
```

compose.admin.yml

Admin-only extension.

Should include:

* Embedder backend
* Embedding LLM through Docker Model Runner
* Admin ingestion volumes
* Admin ingestion environment variables

Run with:
```bash
docker compose -f compose.yml -f compose.admin.yml up --build
```

Do not ship this file to normal users.

compose.prod.yml

Production override file.

Should later define:

* Production image tags
* Restart policies
* Server ports
* HTTPS/reverse proxy assumptions
* Production environment variables
* Volume strategy
* Logging settings
* Resource limits

Run with:
```bash
docker compose -f compose.yml -f compose.prod.yml up -d
```

## Services

### postgres

Responsibilities:

* Persistent relational data
* Vector storage
* User data
* Chat data
* RAG documents/chunks/embeddings

Requirements:

* Persistent volume
* Healthcheck
* Vector extension enabled
* No public exposure in production unless explicitly needed

### retriever

Responsibilities:

* User-facing FastAPI backend
* Authentication
* Chat API
* User settings API
* RAG retrieval
* Workflow routing
* Prompt building
* Chat LLM calls
* Serve built frontend in user deployment

Depends on:

* postgres
* Chat model runtime

### frontend

Development responsibility:

* React/Vite dev server

Production/user-shipping responsibility:

* Built static frontend should be served by retriever

The frontend dev service may exist for development, but normal user deployment should not require a separate frontend container.

### embedder

Admin-only.

Responsibilities:

* Document ingestion
* Chunking
* Embedding generation
* Storing vectorized content
* Assigning training/class tags

Must only exist in compose.admin.yml.

### chat-llm

Responsibilities:

* Run chat model through Docker Model Runner

Used by:

* retriever

### embedding-llm

Responsibilities:

* Run embedding model through Docker Model Runner

Used by:

* embedder

Should only be needed in admin ingestion mode unless retrieval-time embedding is required.

## Volumes

Required volumes:
```txt
postgres_data
```

Environment files

Use separate env files:
```txt
.env.example
.env
.env.admin.example
.env.admin
.env.prod.example
```

Rules:

* Commit only example env files.
* Never commit real secrets.
* Admin env files must not be shipped to normal users.
* Production secrets must be injected securely.

Required environment variables

Expected base variables:
```txt
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
DATABASE_URL=
CHAT_MODEL_NAME=
CHAT_MODEL_BASE_URL=
APP_ENV=
SECRET_KEY=
```

Expected admin variables:
```txt
EMBEDDING_MODEL_NAME=
EMBEDDING_MODEL_BASE_URL=
ADMIN_INGESTION_ENABLED=
```

## Security rules

* Normal users must not run embedder.
* Normal users must not receive admin ingestion config.
* Normal users must not receive admin-only volumes.
* Database credentials must not be hardcoded.
* Secrets must not be committed.
* Backend must enforce auth even if services are local.
* RAG filtering must not rely on Docker separation alone.

## Local development flow

First start normal runtime:
```bash 
docker compose up --build
```

For admin ingestion:
```bash
docker compose -f compose.yml -f compose.admin.yml up --build
```

## Production direction

In production:

* Application should be hosted centrally.
* Retriever backend should serve the built frontend.
* PostgreSQL should use persistent managed or server storage.
* Admin ingestion should run in a restricted admin environment.
* Normal users should only access the public web/API endpoint.
* Embedder must not be publicly exposed.

## Tests and checks

Compose validation
```bash
docker compose config
docker compose -f compose.yml -f compose.admin.yml config
```

Build checks
```bash
docker compose build
docker compose -f compose.yml -f compose.admin.yml build
```

## Runtime checks

* postgres becomes healthy.
* retriever starts after database is healthy.
* Frontend is reachable.
* Login endpoint is reachable.
* Admin embedder is not present in normal runtime.
* Admin embedder is present only when compose.admin.yml is included.

## Acceptance criteria

* compose.yml runs the normal app.
* compose.admin.yml adds admin ingestion only.
* Normal user deployment does not require embedder.
* Admin ingestion can write embeddings to the same database.
* Frontend can be served by retriever for shipped deployments.
* Compose config validates.
* Documentation explains both runtime modes.