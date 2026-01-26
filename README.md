# Dagboek - Persoonlijk Dashboard

Een moderne, luxe dagboek applicatie voor het tracken van werk planning, fitness en financiën.

## Features

- 🎨 Modern luxe design
- 📱 Responsive layout
- 🔐 Login authenticatie
- 📊 Dashboard voor werk, fitness en financiën
- 💾 Prisma database integratie
- 🏋️ Fitness tracking (workouts, gewicht)
- 💰 Financiële transacties
- 📝 Notities en pipeline management
- 💧 Water intake tracking

## Getting Started

### Installatie

```bash
npm install
```

### Database Setup

1. Maak een `.env` bestand aan in de root directory:
```env
DATABASE_URL="your-prisma-database-url"
```

2. Genereer de Prisma Client:
```bash
npm run db:generate
```

3. Voer migraties uit:
```bash
npm run db:migrate
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

### Build voor Productie

```bash
npm run build
npm start
```

## Database Commands

- `npm run db:generate` - Genereer Prisma Client
- `npm run db:migrate` - Voer database migraties uit
- `npm run db:push` - Push schema changes naar database
- `npm run db:studio` - Open Prisma Studio (database GUI)

## API Routes

De applicatie heeft de volgende API endpoints:

- `/api/tasks` - Werk en persoonlijke taken (GET, POST, PUT, DELETE)
- `/api/projects` - Projecten (GET, POST, PUT, DELETE)
- `/api/workouts` - Workouts (GET, POST, PUT, DELETE)
- `/api/weights` - Gewicht entries (GET, POST, PUT, DELETE)
- `/api/transactions` - Financiële transacties (GET, POST, PUT, DELETE)
- `/api/notes` - Notities (GET, POST, PUT, DELETE)
- `/api/pipeline` - Pipeline items (GET, POST, PUT, DELETE)
- `/api/water` - Water intake (GET, POST, DELETE)

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Prisma 6 (PostgreSQL)
- Framer Motion

