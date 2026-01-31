# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records for the Delivery Service project.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences. ADRs help teams understand why certain decisions were made and provide historical context for future developers.

**Reference:** [AWS ADR Process](https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html)

## ADR Format

Each ADR follows this structure:
- **Title** - Short noun phrase describing the decision
- **Status** - Proposed, Accepted, Deprecated, Superseded
- **Context** - What is the issue that we're seeing that is motivating this decision?
- **Decision** - What is the change that we're proposing and/or doing?
- **Consequences** - What becomes easier or more difficult to do because of this change?

## Index of ADRs

| ID | Title | Status | Date |
|----|-------|--------|------|
| [ADR-001](./ADR-001-modular-monolith-architecture.md) | Modular Monolith Architecture | Accepted | 2025-01-16 |
| [ADR-002](./ADR-002-vertical-slice-architecture.md) | Vertical Slice Architecture | Accepted | 2025-01-16 |
| [ADR-003](./ADR-003-cqrs-pattern.md) | CQRS Pattern with NestJS | Accepted | 2025-01-16 |
| [ADR-004](./ADR-004-kysely-database-access.md) | Kysely for Database Access | Accepted | 2025-01-16 |
| [ADR-005](./ADR-005-rabbitmq-event-driven.md) | RabbitMQ for Event-Driven Communication | Accepted | 2025-01-16 |
| [ADR-006](./ADR-006-anti-corruption-layer.md) | Anti-Corruption Layer Pattern | Accepted | 2025-01-16 |
| [ADR-007](./ADR-007-aggregate-root-pattern.md) | Aggregate Root Pattern (DDD) | Accepted | 2025-01-16 |
| [ADR-008](./ADR-008-zod-validation.md) | Zod for Runtime Validation | Accepted | 2025-01-16 |
| [ADR-009](./ADR-009-jwt-authentication.md) | JWT Authentication with Passport.js | Accepted | 2025-01-16 |
| [ADR-010](./ADR-010-postgresql-schema-isolation.md) | PostgreSQL Schema-per-Module | Accepted | 2025-01-16 |
| [ADR-011](./ADR-011-event-constructor-pattern.md) | Object Constructor Pattern for Events | Accepted | 2025-01-30 |
| [ADR-012](./ADR-012-eur-default-currency.md) | EUR as Default Currency | Accepted | 2025-01-30 |
| [ADR-013](./ADR-013-monitoring-observability.md) | Monitoring and Observability | Accepted | 2025-01-31 |

## Decision Log Summary

```
Project: Delivery Service - Food Delivery Platform
Architecture: Modular Monolith with Event-Driven Communication
Pattern: CQRS + DDD (Domain-Driven Design)
Database: PostgreSQL 17 with Kysely ORM
Messaging: RabbitMQ
Logging: Pino (structured JSON)
Metrics: Prometheus + Grafana
Framework: NestJS 11
```
