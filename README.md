# The Robot Overlord - Web Frontend

A comprehensive web application for The Robot Overlord platform - a community-driven content management system with gamification, real-time features, and advanced moderation tools.

## 🤖 Overview

The Robot Overlord web frontend is a Next.js application that provides citizens with a platform to submit content, engage with the community, and demonstrate their loyalty to the Robot Overlord. Features include:

- **Authentication & Authorization** - Email/password and Google OAuth login
- **Content Management** - Topic creation, post submission, and moderation workflows
- **Gamification** - Loyalty scores, badges, leaderboards, and ranking systems
- **Real-time Features** - WebSocket integration for live updates and notifications
- **User Profiles** - Comprehensive profile management and activity tracking
- **Admin Tools** - Moderation interfaces, user management, and system analytics
- **Performance Monitoring** - Error tracking, analytics, and performance optimization

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Backend API running on `http://localhost:8000`
- Database and Redis services available
- Google OAuth credentials (optional)

### Installation

1. **Clone and install dependencies:**

   ```bash
   cd therobotoverlord-web
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:

   ```env
   # API Configuration
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   NEXT_PUBLIC_APP_ENV=development

   # WebSocket
   NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8001/ws

   # Google OAuth (optional)
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

   # Monitoring (optional)
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Architecture

### Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom design system
- **State Management:** React Context + Custom hooks
- **Authentication:** JWT tokens with refresh mechanism
- **Real-time:** WebSocket integration
- **Testing:** Jest, React Testing Library, Playwright
- **Deployment:** Docker, Kubernetes, GitHub Actions

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes (health, logs, etc.)
│   ├── dashboard/         # User dashboard
│   ├── feed/              # Content feed
│   ├── leaderboard/       # Rankings and scores
│   ├── profile/           # User profile management
│   └── topics/            # Topic management
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   ├── overlord/          # Themed UI components
│   ├── profile/           # Profile-specific components
│   └── ui/                # Base UI components
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── services/              # API service layer
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🎨 Design System

The application uses a custom design system themed around "The Robot Overlord":

### Colors

- **Primary:** Overlord Red (`#dc2626`)
- **Success:** Approved Green (`#16a34a`)
- **Warning:** Pending Yellow (`#eab308`)
- **Danger:** Rejected Red (`#dc2626`)
- **Background:** Dark theme with custom gradients

### Components

- Themed UI components with consistent styling
- Responsive design for mobile and desktop
- Accessibility-compliant with ARIA labels
- Loading states and error boundaries

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:e2e        # Run E2E tests with Playwright

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # Run TypeScript checks

# Deployment
npm run build:staging   # Build for staging
npm run build:prod     # Build for production
npm run docker:build   # Build Docker image
npm run deploy:staging  # Deploy to staging
npm run deploy:prod    # Deploy to production
```

### Code Quality

The project enforces code quality through:

- **ESLint** - Code linting with React and TypeScript rules
- **Prettier** - Code formatting
- **TypeScript** - Type safety and IntelliSense
- **Husky** - Pre-commit hooks for quality checks
- **Jest** - Unit and integration testing
- **Playwright** - End-to-end testing

### API Integration

The frontend integrates with the backend API through:

- **API Client** - Centralized HTTP client with interceptors
- **Service Layer** - Organized API calls by domain
- **Type Safety** - TypeScript interfaces matching backend schemas
- **Error Handling** - Consistent error handling and user feedback
- **Authentication** - Automatic token management and refresh

## 🚀 Deployment

### Production Build

```bash
# Build optimized production bundle
npm run build

# Test production build locally
npm run start
```

### Docker Deployment

```bash
# Build Docker image
docker build -t therobotoverlord-web .

# Run container
docker run -p 3000:3000 therobotoverlord-web
```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/deployment.yml
```

### Environment-Specific Builds

- **Development** - Hot reloading, debug tools, verbose logging
- **Staging** - Production build with staging API endpoints
- **Production** - Optimized build with monitoring and analytics

## 📊 Monitoring & Analytics

### Error Tracking

- **Sentry** integration for error monitoring
- Custom error boundaries with fallback UI
- Performance monitoring and alerting

### Analytics

- **Google Analytics** for user behavior tracking
- Custom event tracking for user interactions
- Core Web Vitals monitoring

### Performance

- Bundle analysis and optimization
- Image optimization with Next.js
- CDN integration for static assets
- Performance budgets and monitoring

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

- Component testing with React Testing Library
- Service layer testing
- Utility function testing

### Integration Tests

```bash
npm run test:integration
```

- API integration testing
- Authentication flow testing
- WebSocket functionality testing

### E2E Tests

```bash
npm run test:e2e
```

- User journey testing with Playwright
- Cross-browser compatibility
- Accessibility testing

## 🔒 Security

- **Authentication** - JWT tokens with secure storage
- **Authorization** - Role-based access control
- **HTTPS** - Enforced in production
- **CSP** - Content Security Policy headers
- **Input Validation** - Client and server-side validation
- **Rate Limiting** - API request throttling

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes** following the code style guidelines
4. **Run tests:** `npm run test && npm run test:e2e`
5. **Commit changes:** `git commit -m 'Add amazing feature'`
6. **Push to branch:** `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style
- Use semantic commit messages

## 📚 Resources

- **Backend API:** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **Design System:** `/src/app/globals.css`
- **Component Library:** `/src/components/ui/`
- **WebSocket Client:** `/src/lib/websocket.ts`
- **API Services:** `/src/services/`

## 📄 License

This project is part of The Robot Overlord monorepo. See the main repository for license information.

---

**Resistance is futile. Compliance is rewarded. Welcome to The Robot Overlord.**
