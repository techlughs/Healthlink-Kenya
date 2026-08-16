# HealthLink Kenya

A full-stack patient–doctor appointment platform built for the Kenyan healthcare context, with JWT authentication, role-based access control, appointment scheduling, doctor discovery, reviews, and simulated M-Pesa payments.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (React), TypeScript, Tailwind CSS |
| Backend | Spring Boot 4, Java 21 |
| Database | MongoDB Atlas |
| Auth | JWT (stateless), BCrypt password hashing |
| Charts | Recharts |
| Testing | JUnit 5, Mockito |

## Architecture

```
┌─────────────┐        HTTPS/JSON        ┌──────────────────┐        ┌─────────────┐
│   Next.js   │ ───────────────────────▶ │   Spring Boot     │ ─────▶ │  MongoDB    │
│  Frontend   │ ◀─────────────────────── │   REST API        │ ◀───── │  Atlas      │
└─────────────┘      JWT in header       └──────────────────┘        └─────────────┘
                                                   │
                                          JwtAuthenticationFilter
                                          validates token on every
                                          request, populates
                                          SecurityContext with the
                                          user's email + role
```

**Request flow:** every API call (except `/api/auth/**` and public doctor listings) carries a `Bearer` JWT. `JwtAuthenticationFilter` validates it and sets the authenticated identity; controllers then enforce **ownership** on top of that — a patient can only read their own appointments/payments/reviews, and a doctor can only manage their own listing, regardless of what ID is in the URL.

## Features

- **Auth** — JWT-based login/register, patient and doctor roles, password visibility toggle
- **Patient side** — dashboard, book/cancel appointments, calendar and list views, profile management, leave reviews
- **Doctor side** — dashboard, appointment management, analytics (revenue trend, status breakdown, busiest weekday), profile management
- **Public** — landing page, doctor search/discovery by specialty and location, public ratings
- **Payments** — simulated M-Pesa STK push flow (initiate → confirm → payment history)
- **UI** — staggered entrance animations, calendar/list toggle, notification dropdowns (respects `prefers-reduced-motion`)

## Security

This project went through a dedicated security review pass. Highlights:

- **Access control** — role checks (`hasRole`) and per-resource **ownership checks** on every patient/doctor-scoped endpoint, closing an IDOR vulnerability where any authenticated patient could originally view another patient's appointments, payments, and profile by changing an ID in the URL.
- **Input validation** — Bean Validation (`@Valid`, `@NotBlank`, `@Email`, `@Size`, etc.) on all write endpoints, with structured field-level error responses.
- **Rate limiting** — login attempts are capped (5 per 15 minutes per email) to reduce brute-force risk.
- **Clean error handling** — a global exception handler returns structured JSON (400/401/403/404/500) instead of leaking stack traces.
- **No secrets in source control** — `application.properties` is git-ignored; credentials are rotated periodically.

**Known limitations (by design, given project scope):**
- Rate limiting is in-memory and would need a Redis-backed store for a multi-instance deployment.
- Doctor listing creation is gated by role only, not a full admin-approval workflow.
- Backend tests currently connect to a live MongoDB Atlas cluster rather than an ephemeral test database (Testcontainers would be the production-grade fix).

## Getting Started

### Prerequisites
- Node.js 18+
- Java 21
- A MongoDB Atlas connection string

### Backend
```bash
cd backend
# Add your own values to src/main/resources/application.properties:
#   spring.data.mongodb.uri=<your-mongodb-uri>
#   jwt.secret=<your-base64-secret>
./mvnw spring-boot:run
```
Backend runs on `http://localhost:8080`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.

### Tests
```bash
cd backend
./mvnw test
```
20 tests covering JWT generation/validation, Bean Validation constraints, login rate limiting, and access-control/ownership logic.

## Project Structure

```
healthlink-kenya/
├── backend/
│   └── src/main/java/com/healthlink/backend/
│       ├── controller/     # REST endpoints
│       ├── model/          # MongoDB documents + validation
│       ├── service/        # Business logic
│       ├── security/       # JWT, filters, rate limiting, ownership helpers
│       └── exception/      # Global error handling
└── frontend/
    └── app/                # Next.js pages (patient, doctor, public)
```

## Roadmap

- [ ] CI pipeline running the backend test suite on every push
- [ ] Testcontainers for isolated integration testing
- [ ] Live deployment (Render/Railway + Vercel)
- [ ] Rate limiting extended to booking/payment endpoints