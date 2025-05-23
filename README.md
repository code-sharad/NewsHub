# NewsHub - Community News Discussion Platform

A comprehensive, modern news discussion platform that aggregates news from multiple sources and provides a premium community experience for discussing current events.

## Features

### ✨ Core Features
- **Multi-Source News Aggregation**: Fetches news from The Hindu, Indian Express, and Economic Times
- **User Authentication**: Google OAuth integration via NextAuth.js
- **Article Bookmarking**: Save articles for later reading
- **Advanced Article Parsing**: Full article content extraction from external sources
- **Search & Filtering**: Search across articles and filter by news sources
- **Responsive Design**: Modern 3-column layout with mobile-responsive design

### 🎨 UI/UX Features
- **Premium Design**: Clean, modern interface with shadcn/ui components
- **Real-time Interactions**: Smooth animations and hover effects
- **Dark Mode Support**: Full dark/light theme support
- **Community Features**: Discussion threads, AI suggestions, and user profiles
- **Gamification**: User badges, contribution tracking, and engagement metrics

### 🔧 Technical Features
- **Next.js 15**: Latest React framework with App Router
- **TypeScript**: Full type safety throughout the application
- **Prisma ORM**: Database management with SQLite
- **Tailwind CSS**: Utility-first CSS framework
- **Server Components**: Optimized performance with React Server Components

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **Authentication**: NextAuth.js with Google Provider
- **Database**: SQLite with Prisma ORM
- **API Integration**: Custom news aggregation API
- **Deployment**: Vercel (recommended)

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Google OAuth credentials

### 1. Clone the Repository

```bash
git clone <repository-url>
cd newshub
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a .env.local file in the root directory:

```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL="file:./dev.db"

# Backend API
BACKEND_API_URL=https://sharad31-newshub-fast-api.hf.space
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm dlx prisma generate

# Create database
pnpm dlx prisma db push
```

### 5. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to your .env.local

### 6. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth configuration
│   │   ├── bookmarks/     # Bookmark management
│   │   └── article-content/ # Article parsing
│   ├── article/           # Article detail page
│   ├── bookmarks/         # Bookmarks page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── news-hub/         # Main application components
│   └── providers/        # Context providers
├── lib/                  # Utility functions
│   ├── api.ts           # News API integration
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Database client
│   └── utils.ts         # Utility functions
└── prisma/              # Database schema
    └── schema.prisma    # Prisma schema definition
```

## API Integration

The platform integrates with a FastAPI backend for news aggregation and article parsing:

### News Sources
- `GET /news/thehindu` - Fetch The Hindu articles
- `GET /news/indianexpress` - Fetch Indian Express articles  
- `GET /news/economictimes` - Fetch Economic Times articles

### Article Parsing
- `POST /news-url` - Parse full article content from URL

## Key Components

### NewsHub Main Component
The central hub that orchestrates the 3-column layout and manages state for news data, filtering, and search.

### News Feed
Displays articles in a card-based layout with:
- Article metadata and thumbnails
- Bookmark functionality
- Discussion links
- Source-based filtering

### Article Page
Full article view with:
- Parsed content from backend API
- Bookmark management
- Social sharing
- Related discussions

### Bookmarks System
Complete bookmark management:
- Save/remove articles
- Search bookmarks
- Persistent storage
- User-specific collections

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL="file:./dev.db"
BACKEND_API_URL=https://sharad31-newshub-fast-api.hf.space
```

## Development

### Database Management

```bash
# View database in Prisma Studio
pnpm dlx prisma studio

# Reset database
pnpm dlx prisma db push --force-reset

# Generate new migration
pnpm dlx prisma migrate dev --name migration-name
```

### Adding New Components

This project uses shadcn/ui for components:

```bash
# Add new shadcn component
pnpx shadcn@latest add component-name
```

### Code Quality

```bash
# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Run linting with fixes
pnpm lint --fix
```

## Features Roadmap

- [ ] Real-time notifications
- [ ] Advanced discussion threads
- [ ] AI-powered article summaries
- [ ] Social media integration
- [ ] Mobile app (React Native)
- [ ] Offline reading support
- [ ] Advanced analytics dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email [your-email] or create an issue in the GitHub repository.
