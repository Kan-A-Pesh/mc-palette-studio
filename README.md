# Turbo Template

A modern full-stack web application built with Next.js and organized as a monorepo using Turborepo. This project features authentication, database integration, realtime capabilities, and a scalable architecture designed for rapid development.

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** - React framework for production
- **[Turborepo](https://turbo.build/repo)** - High-performance build system for monorepos
- **[Better Auth](https://www.better-auth.com/)** - Modern authentication library
- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM for SQL databases
- **[Neon](https://neon.tech/)** - Serverless PostgreSQL with branching
- **[Vercel](https://vercel.com/)** - Deployment and environment management
- **[Railway](https://railway.app/)** - Realtime service hosting
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library built with Radix UI and Tailwind CSS
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking

## Project Structure

```
turbo-template/
├── apps/
│   ├── web/                 # Next.js web application
│   └── realtime/            # Socket.IO realtime server
├── packages/
│   ├── database/            # Database schema, migrations, and auth config
│   ├── realtime/            # Shared realtime types and utilities
│   ├── server/              # oRPC server routers and procedures
│   ├── email/               # Email templates (React Email)
│   ├── env/                 # Shared environment validation
│   ├── ui/                  # Shared UI components
│   ├── eslint-config/       # Shared ESLint configurations
│   └── typescript-config/   # Shared TypeScript configurations
├── docker-compose.yml       # Local PostgreSQL + Redis setup
└── turbo.json               # Turborepo configuration
```

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** 9.0.0 or higher
- **Docker** (for local development)
- **Vercel CLI** (`npm i -g vercel`)
- **GitHub CLI** (`gh`) for setup script

## Getting Started

Quick start for local development:

```bash
# Clone and install
git clone git@github.com:your-org/your-repo.git
cd your-repo
pnpm install

# Link to Vercel and pull environment variables
vercel link
pnpm env:pull

# Start database and apply schema
pnpm db:start
pnpm db:push

# Start development
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Setting Up Your Own Project

After cloning this template for a new project, follow these steps:

### 1. Create External Services

1. **Vercel**: Create a new project and link it
2. **Neon**: Create a database and connect via Vercel integration
3. **Railway**: Create a project for the realtime service
4. **Resend**: Create an account for email sending

### 2. Configure Vercel Environment Variables

Set these in your Vercel project settings:

| Variable              | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `DATABASE_URL`        | Neon connection string (set automatically by integration) |
| `REDIS_URL`           | Redis connection string                                   |
| `BETTER_AUTH_SECRET`  | Auth secret (`openssl rand -base64 32`)                   |
| `RESEND_API_KEY`      | Resend API key                                            |
| `RESEND_FROM_EMAIL`   | From email address                                        |
| `REALTIME_SECRET_KEY` | Shared secret for realtime (`openssl rand -base64 32`)    |
| `REALTIME_TCP_URL`    | Railway TCP endpoint (e.g., `tcp://host:9000`)            |

### 3. Configure GitHub Actions Secrets

Run the setup script to configure GitHub secrets:

```bash
pnpm setup:github
```

This will interactively set up these secrets:

| Secret               | Description         | Source                                                           |
| -------------------- | ------------------- | ---------------------------------------------------------------- |
| `RAILWAY_TOKEN`      | Railway API token   | [railway.app/account/tokens](https://railway.app/account/tokens) |
| `RAILWAY_PROJECT_ID` | Railway project ID  | Railway project settings                                         |
| `RAILWAY_SERVICE_ID` | Realtime service ID | Railway service settings                                         |
| `VERCEL_TOKEN`       | Vercel API token    | [vercel.com/account/tokens](https://vercel.com/account/tokens)   |
| `VERCEL_ORG_ID`      | Vercel org/team ID  | Auto-detected from `.vercel/project.json`                        |
| `VERCEL_PROJECT_ID`  | Vercel project ID   | Auto-detected from `.vercel/project.json`                        |

The script will:

- Auto-detect values from `.vercel/project.json` and `.env`
- Prompt for values that need to be entered manually
- Ask before overwriting existing secrets

### 4. Enable Railway PR Environments

1. Go to Railway project settings
2. Enable "PR Environments"
3. Set base environment variables (REDIS_URL, REALTIME_SECRET_KEY, etc.)

## Available Scripts

### Development

- **`pnpm dev`** - Start all apps in development mode
- **`pnpm build`** - Build all apps and packages
- **`pnpm lint`** - Lint all packages
- **`pnpm checks`** - Run format check, type check, and lint

### Database

- **`pnpm db:start`** - Start local PostgreSQL + Redis
- **`pnpm db:stop`** - Stop local database containers
- **`pnpm db:push`** - Push schema to database
- **`pnpm db:generate`** - Generate migrations
- **`pnpm db:migrate`** - Run migrations
- **`pnpm db:studio`** - Open Drizzle Studio

### Environment

- **`pnpm env:pull`** - Pull environment variables from Vercel

### Setup

- **`pnpm setup:vercel`** - Link to Vercel and pull env vars
- **`pnpm setup:github`** - Configure GitHub Actions secrets
- **`pnpm setup:sync`** - Set up template sync remote

### UI Components

- **`pnpm ui:add`** - Add shadcn/ui components

## Preview Environments

When a PR is opened:

1. **Vercel** creates a preview deployment
2. **Neon** creates a database branch (via Vercel integration)
3. **Railway** creates a PR environment
4. **GitHub Actions** syncs the Vercel preview URL and Neon DATABASE_URL to Railway

This ensures the realtime service connects to the correct preview web app and database branch.

## Development Workflow

```bash
# Start services
pnpm db:start
pnpm dev

# Make changes, then run checks
pnpm checks

# Commit and push - CI will run automatically
git add .
git commit -m "feat: your feature"
git push
```

## Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Neon Documentation](https://neon.tech/docs)
- [Railway Documentation](https://docs.railway.app)

## Troubleshooting

### Database Connection Issues

```bash
# Restart local database
pnpm db:stop && pnpm db:start

# Check Docker containers
docker ps
```

### Environment Variables

```bash
# Re-pull from Vercel
pnpm env:pull

# Verify .env file exists
cat .env
```

### GitHub Actions Secrets

```bash
# Re-run setup script
pnpm setup:github

# Or manually check secrets
gh secret list
```

## License

This project is private and not licensed for public use.
