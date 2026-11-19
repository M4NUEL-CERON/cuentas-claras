# Cuentas Claras ☕

> *Cuentas claras, chocolate espeso*: a Colombian saying for "settle up and stay friends".

Split shared expenses (a trip, a flat, a dinner) without signing up. Create a group, share the link, log who paid what, and the app tells everyone who pays whom.

## How it works

- **The link is the key.** Each group gets a random 10-character code; anyone with the link can view and edit it.
- **Money is exact.** Amounts are stored as integer minor units (cents, or whole pesos for COP/CLP). Uneven splits hand the leftover units to the first participants, so shares always add up to the expense.
- **Few transfers.** Settlement is greedy: whoever owes the most pays whoever is owed the most, repeatedly. Every step settles at least one person, so a group of *n* needs at most *n − 1* transfers.

## API

| Method | Path | |
|---|---|---|
| `POST` | `/api/groups` | `{ name, currency, members: [..] }` → new group |
| `GET` | `/api/groups/{code}` | group with members, expenses, balances and settlements |
| `POST` | `/api/groups/{code}/members` | `{ name }` |
| `POST` | `/api/groups/{code}/expenses` | `{ description, amount, payerId, participantIds }` |
| `DELETE` | `/api/groups/{code}/expenses/{id}` | |

Every write returns the full updated group. Errors are RFC 9457 problem details (`detail` is safe to show). Currencies: COP, CLP (no decimals), USD, EUR, MXN, PEN, ARS.

## Stack

- **backend/**: Java 25, Spring Boot 4 (Web MVC, Data JPA, Validation), PostgreSQL with Flyway migrations, Docker. Tests run the real app on H2 in PostgreSQL mode with the same migration.
- **frontend/**: React 18 + TypeScript + Vite, ES/EN, no UI framework. Chocolo the capybara is hand-drawn SVG.

## Run locally

```bash
createdb cuentas_claras
cd backend && DATABASE_URL=jdbc:postgresql://localhost:5432/cuentas_claras DATABASE_USER=$USER DATABASE_PASSWORD= PORT=8090 ./mvnw spring-boot:run
cd frontend && npm install && npm run dev   # http://localhost:5173, talks to :8090
```

Tests: `cd backend && ./mvnw test` · `cd frontend && npm test`

## Deploy

- **API** on Render (`render.yaml`, Docker). Set `DATABASE_URL` as a JDBC URL (`jdbc:postgresql://host/db?sslmode=require`), plus `DATABASE_USER`, `DATABASE_PASSWORD`, and `CORS_ALLOWED_ORIGINS` (the frontend URL).
- **Frontend** on Vercel with root `frontend/` and `VITE_API_URL` pointing at the API.

Made by [Manuel Cerón](https://manuelceron.vercel.app).
