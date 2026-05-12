# AI Contract

This file defines non-negotiable rules for AI-assisted development in spark-tutor.

## Primary rule

AI agents must improve the general system, not patch isolated examples.

## Product principles

spark-tutor must:

- Support real learning, not only answer generation.
- Preserve user and class data boundaries.
- Keep RAG retrieval scoped to the authenticated user.
- Keep admin ingestion and embedding separate from user-facing retrieval.
- Persist chats and settings reliably.
- Make AI behavior configurable without creating unsafe bypasses.
- Be deployable through Docker Compose.
- Be ready to evolve from local test deployment to central server deployment.

## Forbidden shortcuts

Do not introduce:

- Hardcoded responses for specific prompts.
- Special handling for individual users, class IDs, file names, or test examples.
- Business rules inside React components.
- Prompt templates hidden inside unrelated code.
- Retrieval without class/training filtering.
- Authentication bypasses for convenience.
- Silent failure when attachment parsing, retrieval, or model calls fail.
- Unlogged destructive admin operations.
- Untested changes to auth, RAG filtering, persistence, or AI routing.

## AI workflow requirements

All user prompts must pass through a workflow-routing step.

The workflow router must decide whether the prompt needs:

- Socratic tutoring
- Teacher-support question generation
- Exercise generation
- Exercise solution verification
- Direct teaching of a topic
- A future workflow

The router must consider chat history.

Workflow decisions should be inspectable during development.

## Prompt requirements

Each core functionality must have its own prompt template.

Prompt templates must be versioned in code or configuration.

Prompt templates must clearly define:

- Role
- Goal
- Inputs
- Output format
- Safety/quality constraints
- RAG usage rules
- Attachment usage rules

## RAG requirements

RAG retrieval must always include:

- User ID
- Training/class ID
- Chat context where relevant
- Workflow type
- Query text
- Retrieval filters

RAG retrieval must never return content outside the user’s training/class scope.

## Attachment requirements

Attachments must be treated as untrusted input.

The system must validate:

- File type
- File size
- Parsing success
- Malware/security assumptions where applicable
- Whether the file content is needed for the selected workflow

## Persistence requirements

Persist:

- Chats
- Messages
- User settings
- User-to-training/class mapping
- Attachment metadata
- RAG documents
- RAG chunks
- Embedding metadata
- Workflow decisions where useful

Do not persist:

- Plaintext passwords
- Secrets
- API keys
- Raw temporary files longer than necessary unless explicitly required

## Testing requirements

Tests are required for:

- Workflow routing
- RAG class/training filtering
- Auth flows
- Password changes
- Chat ownership
- User settings persistence
- Attachment handling
- Prompt-template selection
- Exercise verification behavior
- Socratic tutoring behavior boundaries

## Definition of done

A change is done only when:

- The correct domain owns the behavior.
- Tests cover the changed behavior.
- RAG access boundaries remain protected.
- The Docker setup still works.
- Documentation is updated where needed.
- The changelog is updated through the release/changelog process.