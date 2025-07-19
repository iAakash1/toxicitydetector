# 🔍 ToxiMeter - Relationship Toxicity Assessment Tool

A comprehensive full-stack web application for assessing relationship health through research-based questionnaires.

## ✨ Features

- **🎯 Scientific Assessment**: 12 research-based questions with Likert scale responses
- **🔐 Secure Authentication**: NextAuth.js with Google, GitHub, and email providers
- **📊 Personal Dashboard**: Track assessment history with interactive charts
- **🎨 Modern UI**: Glass morphism design with dark/light themes
- **📱 Fully Responsive**: Mobile-first design with PWA capabilities
- **🚀 Real-time Results**: Instant scoring with visual feedback (confetti/shake animations)
- **🔗 Share Results**: Generate shareable links with privacy controls
- **⚡ Performance**: Built on Next.js 14 with server-side rendering
- **🛡️ Type Safety**: End-to-end TypeScript with tRPC for API calls
- **📈 Analytics**: PostHog integration for usage insights

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for state management
- **React Hook Form** with Zod validation

### Backend
- **tRPC** for typesafe API routes
- **Prisma ORM** with PostgreSQL
- **NextAuth.js** for authentication
- **PDF generation** with @react-pdf/renderer

### Infrastructure
- **Vercel** for hosting
- **Neon** for PostgreSQL database
- **PostHog** for analytics
- **GitHub Actions** for CI/CD

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker (for local database)
- PostgreSQL database (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/toximeter.git
   cd toximeter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start local database**
   ```bash
   docker-compose up -d
   ```

5. **Set up database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

## � Automated Deployment Setup

### Prerequisites for Deployment

Before using the automated deployment, ensure you have:

1. **GitHub CLI**: `brew install gh` (macOS) or visit [cli.github.com](https://cli.github.com)
2. **Vercel CLI**: `npm install -g vercel`
3. **pnpm**: `npm install -g pnpm`

### One-Command Deployment

The bootstrap script automates the entire deployment process:

```bash
# Make the script executable
chmod +x scripts/bootstrap.sh

# Run bootstrap with your desired repo name
./scripts/bootstrap.sh toximeter-prod
```

This script will:
- ✅ Create a private GitHub repository
- ✅ Push your code to GitHub
- ✅ Link the project to Vercel
- ✅ Deploy to production
- ✅ Set up environment template

### Manual Setup (Alternative)

If you prefer manual setup:

1. **Create Vercel Token**
   ```bash
   vercel tokens create
   # Copy the token for GitHub Secrets
   ```

2. **Get Project IDs**
   ```bash
   vercel link
   # Check .vercel/project.json for IDs
   ```

3. **Set GitHub Secrets**
   Go to GitHub repo → Settings → Secrets and add:
   - `VERCEL_TOKEN`: Your Vercel token
   - `VERCEL_ORG_ID`: From `.vercel/project.json`
   - `VERCEL_PROJECT_ID`: From `.vercel/project.json`

4. **Configure Environment Variables**
   In Vercel dashboard, set:
   ```env
   DATABASE_URL=your_neon_connection_string
   NEXTAUTH_SECRET=your_secure_random_string
   NEXTAUTH_URL=https://your-domain.vercel.app
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

### Automated CI/CD Pipeline

Once set up, the GitHub Action will:
- 🧪 Run tests on every PR
- 🚀 Deploy previews for PRs
- 📦 Deploy to production on main branch pushes
- 🔍 Run Lighthouse audits on production deployments

### Troubleshooting Deployment

**Bootstrap Script Issues:**
```bash
# Check if CLI tools are installed
gh --version
vercel --version
pnpm --version

# Check authentication
gh auth status
vercel whoami
```

**GitHub Actions Failures:**
- Verify all secrets are set correctly
- Check environment variable naming
- Review build logs in Actions tab

**Vercel Deployment Issues:**
- Ensure environment variables are set in Vercel dashboard
- Check function timeout limits
- Verify database connectivity

## �📊 Scoring Algorithm

The toxicity score is calculated using a weighted scoring system:

1. **Response Mapping**: Likert responses (1-5) are mapped to (-2 to +2)
2. **Weighted Scoring**: Each question has a weight (+2 for toxic indicators, -2 for healthy indicators)
3. **Normalization**: Raw scores are normalized to 0-100% scale
4. **Tier Classification**:
   - 0-24%: Healthy
   - 25-49%: Manageable
   - 50-74%: Concerning
   - 75-100%: Toxic

## 🗄️ Database Schema

```prisma
model User {
  id         String      @id @default(cuid())
  email      String      @unique
  name       String?
  role       Role        @default(USER)
  answerSets AnswerSet[]
}

model Question {
  id     String @id @default(cuid())
  text   String
  weight Int    // -2 to +2
  order  Int    @unique
}

model AnswerSet {
  id       String @id @default(cuid())
  userId   String
  answers  Json   // { questionId: 1-5 }
  percent  Int
  tier     String
  shareId  String? @unique
}
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests  
npm run e2e

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. Fork this repository
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push to main

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## � Deployment Setup

### Prerequisites
- **Node.js 18+** with pnpm
- **GitHub CLI** (`brew install gh` on macOS)
- **Vercel CLI** (`npm install -g vercel`)
- **jq** for JSON processing (`brew install jq` on macOS)

### Getting Vercel Token

1. **Create Vercel token**:
   ```bash
   vercel login
   vercel tokens create ci-token
   ```
   
2. **Copy the token** - you'll need it for GitHub Secrets

### Setting up GitHub Secrets

Add these secrets in your GitHub repository settings (`https://github.com/iAakash1/<repo-name>/settings/secrets`):

- **`VERCEL_TOKEN`** - Your Vercel CI token from above
- **`DATABASE_URL`** - Your PostgreSQL connection string
- **`NEXTAUTH_SECRET`** - Generate with `openssl rand -base64 32`

After running the bootstrap script, also add:
- **`VERCEL_PROJECT_ID`** - From `.vercel/project.json`
- **`VERCEL_ORG_ID`** - From `.vercel/project.json`

### One-Command Deployment

Run the bootstrap script to set up everything automatically:

```bash
# Make the script executable
chmod +x scripts/bootstrap.sh

# Run the bootstrap (replace with your desired repo name)
./scripts/bootstrap.sh toxicity-detector-prod
```

### What the Bootstrap Script Does

1. **🔍 Validates environment** - Checks all required CLI tools are installed
2. **🔐 Verifies authentication** - Ensures GitHub and Vercel CLIs are logged in  
3. **📁 Sets up Git repository** - Initializes if needed, commits pending changes
4. **🚀 Creates GitHub repo** - `gh repo create` with private visibility
5. **🔗 Links Vercel project** - Automatic Next.js detection and configuration
6. **📋 Pulls environment template** - Downloads `.env.local` template
7. **🏗️ Tests build process** - Runs `pnpm install && pnpm build`
8. **🚀 Deploys to production** - `vercel --prod` for initial deployment
9. **📊 Shows project info** - URLs, secrets, and next steps

### Manual Setup (if needed)

If the bootstrap script fails, you can set up manually:

```bash
# 1. Create GitHub repository
gh repo create iAakash1/your-repo-name --private --source=. --push

# 2. Link to Vercel
vercel link

# 3. Set up environment variables in Vercel dashboard
# 4. Deploy
vercel --prod
```

### CI/CD Pipeline

The deployment includes a comprehensive GitHub Actions workflow:

- **🔍 Linting** - ESLint and TypeScript checks
- **🧪 Testing** - Unit tests with PostgreSQL service
- **🏗️ Building** - Next.js build verification
- **🎭 E2E Testing** - Playwright tests (main branch only)  
- **🚀 Preview Deployments** - Automatic PR previews
- **🚀 Production Deployments** - Main branch auto-deployment
- **🔍 Lighthouse Audits** - Performance monitoring
- **📊 Notifications** - Deployment status updates

### Environment Configuration

After deployment, configure these in the Vercel dashboard:

- **Database**: Set up PostgreSQL (Neon, Supabase, etc.)
- **OAuth Providers**: Configure Google/GitHub apps
- **Analytics**: Add PostHog project key (optional)
- **Email**: Configure email provider for magic links

### Troubleshooting

**Build fails?**
- Check environment variables are properly set
- Verify DATABASE_URL is accessible from Vercel

**Authentication issues?**
- Ensure NEXTAUTH_URL matches your domain
- Check OAuth app configurations

**Database connection errors?**
- Verify DATABASE_URL format
- Check database server allows connections from Vercel

### Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] Database accessible and migrated
- [ ] OAuth providers configured with production URLs  
- [ ] Domain name configured (optional)
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Analytics tracking enabled

## �🔒 Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (Optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY="..."
```

## 📈 API Documentation

### tRPC Routes

- `questions.getAll` - Fetch all active questions
- `answers.submit` - Submit assessment responses
- `answers.getHistory` - Get user's assessment history
- `answers.delete` - Delete assessment record

### REST Endpoints

- `GET /api/pdf/[id]` - Generate PDF report
- `GET /share/[shareId]` - Public result view

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](https://github.com/yourusername/toximeter/wiki)
- 🐛 [Report Bug](https://github.com/yourusername/toximeter/issues)
- 💡 [Request Feature](https://github.com/yourusername/toximeter/issues)
- 💬 [Discussions](https://github.com/yourusername/toximeter/discussions)

## 🙏 Acknowledgments

- Research-based questions adapted from relationship psychology literature
- UI inspiration from modern design systems
- Community feedback and contributions

---

**⚠️ Disclaimer**: This tool is for informational purposes only and should not replace professional counseling or therapy. If you're experiencing abuse or safety concerns, please contact appropriate support services.
