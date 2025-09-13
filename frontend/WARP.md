# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
This is a Vue 3 + TypeScript frontend for a real-time analytics dashboard, designed to be migrated from hardcoded/placeholder data to a live Firebase backend using Firestore and Firebase Authentication. The application provides real-time analytics visualization with WebSocket connections, dark/light theme support, and a responsive dashboard interface.

## Development Commands

### Setup and Installation
```bash
npm install
```

### Development Server
```bash
npm run dev           # Start development server with hot reload
```

### Building and Production
```bash
npm run build         # Type-check, compile and minify for production  
npm run build-only    # Build only (skip type checking)
npm run preview       # Preview production build locally
```

### Code Quality
```bash
npm run lint          # Run ESLint with auto-fix
npm run format        # Format code with Prettier
npm run type-check    # Run Vue TypeScript compiler
```

### Testing
```bash
npm run test:unit     # Run unit tests with Vitest
```

### Docker (Production)
```bash
docker build -t analytics-dashboard .
docker run -p 80:80 analytics-dashboard
```

## Architecture Overview

### State Management (Pinia Stores)
- **`stores/auth.ts`**: Authentication state, login/logout, user profile management
- **`stores/analytics.ts`**: Analytics data, real-time WebSocket connections, metrics formatting
- **`stores/ui.ts`**: Theme management, sidebar state, notifications, modal control

### Key Components Structure
- **`views/`**: Main page components (Dashboard, Analytics, Login)
- **`components/layout/DashboardLayout.vue`**: Main layout wrapper with sidebar and header
- **`components/dashboard/MetricCard.vue`**: Reusable metric display cards
- **`components/charts/BaseChart.vue`**: Chart.js wrapper component
- **`components/layout/MobileNav.vue`**: Mobile navigation drawer

### Router Configuration
The router includes authentication guards that check login status and redirect appropriately:
- Public routes: `/login`, `/register`
- Protected routes: `/` (dashboard), `/analytics`, `/reports`, `/users`, `/settings`
- Route guards automatically initialize auth state and enforce authentication

### Real-time Data Flow
1. **WebSocket Connection**: `analyticsStore.connectWebSocket()` establishes Socket.IO connection
2. **Data Subscriptions**: Components subscribe to specific metrics via `subscribeToMetric()`
3. **Live Updates**: Real-time data flows through `analytics_update` socket events
4. **State Synchronization**: Summary data is updated with real-time values automatically

### Styling and Theming
- **Tailwind CSS**: Utility-first styling with custom color palette (primary, secondary, success, warning, danger)
- **Dark Mode**: Class-based dark mode (`dark:`) with system preference detection
- **Custom Design System**: Extended with app-specific colors, animations, and spacing
- **Responsive Design**: Mobile-first approach with breakpoint-aware components

## Environment Configuration

### Required Environment Variables
Copy `.env.example` to `.env.local` and configure:
- `VITE_API_BASE_URL`: Backend API endpoint (default: http://localhost:8000)
- `VITE_WS_URL`: WebSocket endpoint (default: ws://localhost:8000)  
- `VITE_ENABLE_WEBSOCKETS`: Enable real-time features
- `VITE_ENABLE_NOTIFICATIONS`: Enable toast notifications
- `VITE_CHART_REFRESH_INTERVAL`: Chart update interval in ms

## Firebase Migration Context
This application is intended to be migrated from placeholder data to Firebase:
- Authentication should be migrated to Firebase Auth
- Analytics data should come from Firestore collections
- Real-time updates should use Firestore real-time listeners instead of WebSocket
- Preserve existing UI/UX and application logic during migration

## Key Development Patterns

### Store Usage Pattern
```typescript
// In components, use stores via composition API
const analyticsStore = useAnalyticsStore()
const uiStore = useUIStore()

// Initialize data on component mount
onMounted(async () => {
  await analyticsStore.initialize()
})
```

### Chart Data Structure
Charts expect data in Chart.js format:
```typescript
{
  labels: string[],
  datasets: [{
    label: string,
    data: number[],
    borderColor: string,
    backgroundColor: string
  }]
}
```

### Notification System
```typescript
// Use UI store methods for consistent notifications
uiStore.showSuccess('Operation completed')
uiStore.showError('Something went wrong', 'Detailed message', true) // persistent
```

### Theme Management
The app supports auto/light/dark themes with system preference detection. Theme classes are applied to `document.documentElement`.

## Build Optimizations
- **Code Splitting**: Manual chunks for vendor libraries (Vue, UI components, charts, utils)
- **Asset Optimization**: Terser minification with console/debugger removal
- **Bundle Analysis**: Chunk size warnings at 1000kb threshold
- **Pre-bundling**: Optimized deps include Vue ecosystem and Chart.js
- **Production Build**: Multi-stage Docker build with Nginx serving static assets

## Testing Strategy
- **Unit Tests**: Vitest with jsdom for component testing
- **Test Location**: `src/components/__tests__/`
- **Type Safety**: Full TypeScript coverage with Vue TSC
