```md
# Ecommerce MVP — Microservices Backend

Backend RESTful API cho hệ thống thương mại điện tử MVP, xây dựng bằng Node.js theo kiến trúc Microservices, DDD-style và Database-per-Service.

## 1. Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Redis
- JWT
- bcrypt
- Docker
- Docker Compose

## 2. Architecture

```text
Client
   |
   v
API Gateway :3000
   |
   +-------------------+-------------------+-------------------+
   |                   |                   |                   |
   v                   v                   v                   v
Auth Service       Product Service     Order Service      Shipment Service
   |                   |                   |                   |
   v                   v                   v                   v
Auth PostgreSQL    Product PostgreSQL  Order PostgreSQL   Shipment PostgreSQL

                       |
                       v
                    Redis
              +----------------+
              | Product Cache  |
              | Rate Limiting  |
              +----------------+
```

### Services

| Service | Port | Responsibility |
|---|---:|---|
| API Gateway | 3000 | Routing, JWT validation, Authentication, Authorization, Rate limiting, Logging |
| Auth Service | 3001 | Register, Login, Customer, Membership |
| Product Service | 3002 | Product management |
| Order Service | 3003 | Order and OrderDetail |
| Shipment Service | 3004 | Shipment and delivery status |
| Redis | 6379 | Cache and Rate limiting |
| PostgreSQL Auth | 5433 | Auth database |
| PostgreSQL Product | 5434 | Product database |
| PostgreSQL Order | 5435 | Order database |
| PostgreSQL Shipment | 5436 | Shipment database |

## 3. Main Features

- Account registration
- Login
- JWT authentication
- Role-based authorization
- Customer management
- Membership points / score
- Membership tier
- Product management
- Order creation
- OrderDetail
- Discount based on membership points
- Order → Shipment flow
- Shipment status update
- Health check
- API Gateway
- Redis product cache
- Redis rate limiting
- Dockerized microservices
- Database-per-Service

## 4. API Gateway

The API Gateway is the single entry point for clients.

Base URL:

```text
http://localhost:3000
```

Responsibilities:

- Routing
- Authentication
- Authorization
- JWT validation
- Rate limiting
- Request logging
- Redis product caching

## 5. Running with Docker Compose

### Requirements

- Docker Desktop
- Docker Compose

### Start the system

```bash
git clone https://github.com/Vy161105/ecommerce-mvp.git
cd ecommerce-mvp

docker compose up -d --build
```

Check containers:

```bash
docker compose ps
```

Stop the system:

```bash
docker compose down
```

## 6. Health Check

API Gateway:

```bash
curl -i http://localhost:3000/health
```

Expected:

```json
{
  "service": "api-gateway",
  "status": "UP"
}
```

Each microservice also exposes a `/health` endpoint.

## 7. Authentication

### Register

```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"demo01",
    "password":"Password123",
    "email":"demo01@example.com",
    "phone":"0900000001"
  }'
```

Expected:

```text
201 Created
```

The response does not expose the password or password hash.

### Login

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username":"demo01",
    "password":"Password123"
  }'
```

The response contains a JWT access token.

For Git Bash:

```bash
export CUSTOMER_TOKEN="PASTE_JWT_HERE"
```

## 8. Authorization / RBAC

Protected endpoints require:

```text
Authorization: Bearer <JWT>
```

Example:

```bash
curl -i http://localhost:3000/api/auth/users \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```

A customer attempting an admin-only endpoint receives:

```text
403 Forbidden
```

Requests without a JWT receive:

```text
401 Unauthorized
```

## 9. Customer Management

### Get customer list

Admin:

```http
GET /api/auth/users
```

### Get customer

```http
GET /api/auth/users/:id
```

A customer can access their own information while access to another customer's information is restricted.

### Membership points

```http
PATCH /api/auth/users/:id/membership-points
```

Membership tier:

```text
STANDARD
MEMBER
```

A customer with at least 100 membership points receives the MEMBER tier.

## 10. Products

### Get products

```bash
curl -i http://localhost:3000/api/products
```

### Redis Cache

The first request normally returns:

```text
X-Cache: MISS
```

A subsequent request within the cache TTL returns:

```text
X-Cache: HIT
```

Redis is used to cache the product list.

## 11. Orders

### Create order

```http
POST /api/orders
```

The order contains product items and quantities.

The Order Service:

1. Validates the customer.
2. Retrieves product information.
3. Checks stock.
4. Applies membership discount.
5. Creates the Order.
6. Creates OrderDetail/items.
7. Updates product stock.
8. Sends order information to Shipment Service.

### Get current customer's orders

```bash
curl -i http://localhost:3000/api/orders/my \
  -H "Authorization: Bearer $CUSTOMER_TOKEN"
```

## 12. Membership Discount

Membership points are used to determine the customer's membership tier and discount.

Current rule:

```text
membership_points >= 100
        |
        v
     MEMBER
        |
        v
    10% discount
```

Otherwise:

```text
STANDARD
   |
   v
No membership discount
```

## 13. Shipment

Orders are transferred to the Shipment Service after successful order creation.

### Get shipment by order

```http
GET /api/shipments/order/:orderId
```

### Update shipment status

```http
PATCH /api/shipments/:id/status
```

Shipment status is controlled according to the authorized role.

## 14. Rate Limiting

API Gateway uses Redis for rate limiting.

Default configuration:

```text
Maximum requests: 30
Window: 60 seconds
```

Rate-limit response headers include:

```text
X-RateLimit-Limit
X-RateLimit-Remaining
```

When the limit is exceeded:

```text
429 Too Many Requests
```

## 15. Logging

API Gateway logs requests in the following form:

```text
[Gateway] GET /api/products -> 200 25ms
```

This provides request method, path, HTTP status and request duration.

## 16. Database-per-Service

Each business service owns its own PostgreSQL database:

```text
Auth Service      → Auth DB
Product Service   → Product DB
Order Service     → Order DB
Shipment Service  → Shipment DB
```

Services communicate through APIs instead of directly accessing another service's database.

## 17. Demo Flow

A complete demo can be performed in this order:

```text
1. Start Docker Compose
        |
        v
2. Health Check
        |
        v
3. Register Customer
        |
        v
4. Login → JWT
        |
        v
5. Authenticate / Authorize
        |
        v
6. Get Products
        |
        v
7. Redis Cache MISS → HIT
        |
        v
8. Create Order
        |
        v
9. Order + OrderDetail
        |
        v
10. Membership Discount
        |
        v
11. Order → Shipment
        |
        v
12. Shipment Status
        |
        v
13. Rate Limiting
```

## 18. Repository

GitHub:

https://github.com/Vy161105/ecommerce-mvp
```

Sau khi dán vào `README.md`, chạy:

```bash
git add README.md
git commit -m "docs: update project README"
git push origin main
```

Cuối cùng:

```bash
git status
```

Nếu hiện:

```text
nothing to commit, working tree clean
```

thì **chốt bài**.