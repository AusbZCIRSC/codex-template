# Codex Review Checklist

Before claiming completion, verify:

## Architecture

- [ ] Did the change go into the correct layer?
- [ ] Did any business rule leak into UI?
- [ ] Did any domain rule get duplicated?
- [ ] Should `ARCHITECTURE.md` or `projectmap.md` be updated?

## Correctness

- [ ] Does the solution generalize beyond the reported example?
- [ ] Are edge cases covered?
- [ ] Are invalid states handled explicitly?
- [ ] Are fallbacks intentional and tested?

## Tests

- [ ] Existing tests pass.
- [ ] New behavior has tests.
- [ ] Regression tests cover the original bug.
- [ ] Anti-hack tests prevent narrow fixes.

## Code quality

- [ ] No hardcoded special cases.
- [ ] No unexplained broad catch blocks.
- [ ] No dead code.
- [ ] No unnecessary abstractions.
- [ ] No unrelated formatting churn.

## Final response

Include:
- Summary
- Files changed
- Verification commands run
- Risks
- Follow-up suggestions