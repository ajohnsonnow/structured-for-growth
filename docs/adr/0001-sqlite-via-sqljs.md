# ADR-0001: SQLite via sql.js as Primary Database

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2025-01-15 |
| **Decision Makers** | Core team |
| **P-ID** | P1.1.1 |

## Context

SFG needs a persistent data store for users, clients, projects, records, and compliance data. The application targets small-to-medium deployments, often on single-server PaaS platforms like Render. We need zero-dependency database setup—no external database server.

## Decision

Use **SQLite** via the `sql.js` npm package (a WebAssembly build of SQLite). The database runs in-process, is stored as a single file on disk, and is loaded into memory on startup.

## Consequences

### Positive

- Zero infrastructure—no PostgreSQL/MySQL server to configure or manage.
- Single-file backup—copy one `.db` file.
- Fast reads—entire database is in memory.
- Ideal for single-server deployments on Render, Railway, Fly.io.

### Negative

- Single-writer—no concurrent write scalability.
- Memory-bound—entire DB must fit in process memory.
- No built-in replication—if we need horizontal scaling later, we must migrate.

### Risks

- Data loss if the process crashes between in-memory write and disk save. Mitigated by `saveDatabase()` after every `execute()` call.
- If data grows beyond ~500 MB, memory pressure becomes a concern.

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| PostgreSQL | Full ACID, horizontal scaling, mature ecosystem | Requires external server, adds DevOps complexity |
| better-sqlite3 | Native SQLite bindings, faster than sql.js | Native addon build issues on some PaaS |
| LowDB / JSON file | Simpler API | No SQL, no indexing, poor query performance |

## References

- [sql.js documentation](https://sql.js.org/)
- [SQLite documentation](https://www.sqlite.org/docs.html)
