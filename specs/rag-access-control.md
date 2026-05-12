# Feature: RAG Access Control

## Status

Draft

## Problem

Users must only receive knowledge base content belonging to their assigned training/class.

## Goals

- Enforce class/training filtering on every retrieval.
- Prevent accidental cross-class data leakage.
- Make document tagging mandatory during ingestion.
- Test access boundaries.

## Non-goals

- Multi-class users in the first version.
- Public document libraries.
- User-managed ingestion.

## Core rule

Every RAG query must include the authenticated user’s training/class ID.

No backend endpoint may allow a normal user to override this filter.

## Data model expectations

Documents and chunks must include:

- Document ID
- Chunk ID
- Training/class ID tag
- Source metadata
- Text content
- Embedding vector
- Created timestamp
- Updated timestamp

## Retrieval flow

1. Backend authenticates user.
2. Backend loads user training/class ID.
3. Backend builds retrieval query.
4. Backend applies mandatory class/training filter.
5. Database returns only matching chunks.
6. Backend sends filtered context to prompt builder.

## Ingestion flow

1. Admin uploads or imports material.
2. Admin assigns training/class ID.
3. Embedder parses document.
4. Embedder chunks document.
5. Embedder embeds chunks.
6. Embedder stores chunks and vectors with training/class tag.

## Forbidden behavior

- Retrieval without training/class filter.
- User-provided training/class override.
- Returning documents from another class.
- Ingesting documents without class/training tags.
- Using LLM output to decide authorization.

## Tests

### Unit tests

- Retrieval query requires training/class ID.
- Missing training/class ID fails closed.
- User-provided class ID is ignored or rejected.

### Integration tests

- User A in class X retrieves only class X chunks.
- User B in class Y retrieves only class Y chunks.
- Same query text across classes returns different scoped results.

### Security tests

- Cross-class retrieval attempt fails.
- Direct API request with another class ID fails.