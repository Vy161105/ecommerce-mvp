# Ecommerce MVP — Step 1

This checkpoint scaffolds the Identity & Access / Auth Service and its PostgreSQL database.

## Scope

- Node.js + TypeScript
- Express REST API
- DDD-style separation: domain / application / infrastructure / interfaces
- PostgreSQL database-per-service for Auth
- `POST /api/auth/register`
- `GET /health`
- Password hashing with bcrypt
- CUSTOMER as the default role

## Run PostgreSQL

```bash
cp .env.example .env
docker compose up -d postgres-auth
```

## Run Auth Service locally

```bash
cd services/auth-service
npm install
npm run dev
```

## Register

```http
POST http://localhost:3001/api/auth/register
Content-Type: application/json
```

```json
{
  "username": "customer01",
  "password": "123456",
  "email": "customer01@example.com",
  "phone": "0900000000"
}
```

Expected successful status: `201 Created`.

Duplicate username/email: `409 Conflict`.
Invalid request: `400 Bad Request`.

## Health

```http
GET http://localhost:3001/health
```
