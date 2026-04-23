# SteamLite Full-Stack Project

A complete full-stack implementation of the **SteamLite** software model described in the lab report.  
This project translates the report's main use cases into a runnable system with a REST API, role-based access control, database schema, sample data, and a modern web interface.

## Features covered from the report

- Login / authentication
- Browse and search games
- Add games to cart
- Purchase / checkout flow
- Wishlist management
- Admin dashboard to manage games and users

## Tech stack

### Backend
- Node.js
- Express
- Prisma ORM
- SQLite
- JWT authentication
- bcrypt password hashing

### Frontend
- React
- Vite
- TypeScript
- React Router
- Context API

## Project structure

```text
steamlite-fullstack/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       ├── lib/
│       ├── middlewares/
│       ├── modules/
│       ├── routes/
│       ├── types/
│       └── utils/
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       └── pages/
└── docs/
    └── report-traceability.md
```

## Quick start

### 1) Backend setup

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

The backend runs on `http://localhost:5000`.

### 2) Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Demo accounts

After running the seed:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@steamlite.local` | `Admin123!` |
| Customer | `user@steamlite.local` | `User123!` |
| Developer | `dev@steamlite.local` | `Dev123!` |

## Main API routes

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Games
- `GET /api/games`
- `GET /api/games/:id`
- `POST /api/games` (Admin)
- `PATCH /api/games/:id` (Admin)
- `DELETE /api/games/:id` (Admin)

### Cart
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:cartItemId`
- `DELETE /api/cart/items/:cartItemId`

### Wishlist
- `GET /api/wishlist`
- `POST /api/wishlist/:gameId`
- `DELETE /api/wishlist/:gameId`

### Orders
- `GET /api/orders/me`
- `POST /api/orders/checkout`

### Admin
- `GET /api/admin/overview`
- `GET /api/admin/users`
- `GET /api/admin/orders`
- `PATCH /api/admin/users/:id/role`

## Implementation notes

- The data model is based on the report's data dictionary.
- Role handling follows the report's user types: Customer, Developer, Admin.
- The checkout flow simulates a payment success response so the project remains easy to run locally.
- SQLite is used to keep setup simple for grading and demo purposes. You can switch to PostgreSQL later by changing the Prisma datasource.

## Suggested presentation flow

1. Log in with the customer account
2. Browse/search games
3. Add items to cart
4. Checkout and view orders
5. Add/remove items from wishlist
6. Log in with the admin account
7. Manage games and update user roles

## Possible next upgrades

- Payment gateway integration
- Game reviews CRUD UI
- Email notifications
- PostgreSQL + Docker deployment
- Unit and integration tests
- CI/CD pipeline
