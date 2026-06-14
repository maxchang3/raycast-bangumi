---
name: bangumi
description: Use this skill for tasks involving Bangumi (bgm.tv) data, the Bangumi OpenAPI, authentication, or Bangumi resource operations.
---

# Bangumi

Bangumi (`bgm.tv`) is an ACG-focused cataloging and community platform. Its OpenAPI provides access to subjects, episodes, characters, persons, users, collections, indices, revisions, and airing schedules.

Use this skill whenever a task requires retrieving, understanding, or operating on Bangumi data through the official API.

## References

### Bangumi OpenAPI Reference

#### https://bangumi.github.io/api/dist.json

Use for:

- Endpoint definitions
- Request parameters
- Request-body schemas
- Response schemas
- Enum definitions
- Validation rules

Converted types are in `src/types/generated.ts`, you can also refer to that for TypeScript types.

### Local References

#### `reference/openapi-summary.md`

Use for:

- API overview
- Endpoint groups
- Resource categorization
- Common enums
- High-level API behavior

#### `reference/how-to-auth.md`

Use for:

- OAuth flows
- Access token acquisition
- Authorization requirements
- Scope definitions
- User authentication behavior
