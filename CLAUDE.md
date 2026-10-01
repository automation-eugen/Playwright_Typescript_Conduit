# Conduit QA — test automation

Playwright + TypeScript. API tests in tests/api, UI tests (week 2) in tests/ui.

## Conventions
- Import `test` and `expect` from src/fixtures, never from @playwright/test.
- API clients (src/api) return raw APIResponse. Clients never assert or throw.
- Use `api` for anonymous, `authedApi` for the worker user, `createUser()`
  when a test needs a fresh or second user.
- Use a fresh user for tests that mutate or assert on user-level state.
- Assert the exact status code first, then validate the body with parseBody + a schema.
- After any rejected mutation (401/403/422), verify the state is unchanged.
- Never assert on ordering the API does not guarantee.

## Test data
- Identifiers (usernames, emails, slugs) use uniqueId() from src/data/unique.ts, never faker.
- Content fields use faker. Every test is seeded; the seed is in the report as `faker-seed`.
  Replay with FAKER_SEED=<seed>.
- Create articles with the `createArticle` fixture. Cleanup happens in fixture teardown;
  never put cleanup at the end of a test (use try/finally only in tests that test creation itself).
- Never assert on global state (total counts, full tag list, newest item).
  Scope queries to a fresh user or a unique tag, then assert exactly.
- Filter tests include a negative control: data that must NOT match.

## Coverage
- Validation, permission and edge-case tests are data-driven: add a row, not a test.
- Validation tests assert the failing field, not just the status.
- Permission tests use lazy actors and verify state after every rejection.
- Known bugs stay as failing tests marked test.fail() with a link to the bug.
- Tag critical-path tests @smoke.

## Commands
- npm run typecheck
- npm run test:api
- npm run test:smoke