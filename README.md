# Family Hierarchy

A private, long-term family genealogy platform foundation built with a modern frontend and backend stack. This repository currently covers Phases 1–3 only: project foundation, normalized database architecture, and PostgreSQL + Prisma integration.

## Tech Stack

- Frontend: Next.js, React, TypeScript, App Router, Tailwind CSS
- Backend: Node.js, Express.js, TypeScript, dotenv, cors, helmet, cookie-parser, zod
- Database: PostgreSQL + Prisma
- Runtime tooling: tsx

## Project Structure

```text
family-hierarchy/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── constants/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   └── database/
├── .gitignore
├── README.md
└── package-lock.json
```

## Current Scope

The project currently includes the foundation and database architecture required for future genealogy features without implementing authentication, family CRUD, relationship APIs, tree APIs, media uploads, or audit workflows.

## Development Commands

### Frontend

```bash
cd frontend
npm install
npm run build
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Update DATABASE_URL in backend/.env for your local PostgreSQL instance
npm run type-check
npm run dev
```

## Database Setup

1. Install PostgreSQL locally and create a database named `family_hierarchy`.
2. Configure the connection string in `backend/.env` using the local PostgreSQL server.
3. Generate the Prisma client:

```bash
cd backend
npx prisma generate
```

4. Apply the migration history:

```bash
cd backend
npx prisma migrate deploy
```

5. Check migration status:

```bash
cd backend
npx prisma migrate status
```

6. Open Prisma Studio:

```bash
cd backend
npx prisma studio
```

## Health Check

The backend exposes the required health endpoint:

```http
GET /api/health
```

Example response:

```json
{
  "success": true,
  "message": "Family Hierarchy API is running"
}
```

## Notes

- No authentication or user login flow is implemented in this phase.
- No family members, relationships, or tree APIs are implemented yet.
- The permanent source of truth remains the normalized relational model in Prisma and PostgreSQL.
