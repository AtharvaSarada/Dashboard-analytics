# Real-Time Analytics Dashboard

A modern, production-ready real-time analytics dashboard built with Vue.js 3, FastAPI, PostgreSQL, and Redis. Features interactive charts, live data streaming via WebSockets, and comprehensive dashboard customization.

## 🚀 Features

- **Real-time Data Updates**: Live streaming via WebSockets with automatic reconnection
- **Interactive Charts**: Line, bar, pie, area, gauge charts and data tables using Chart.js
- **Responsive Design**: Mobile-first approach with dark/light theme support
- **Advanced Filtering**: Dynamic date range, category, and search filters
- **Dashboard Customization**: Drag-and-drop widget arrangement
- **Data Export**: Charts as images, data as CSV/JSON
- **Authentication**: JWT-based user authentication
- **Performance Optimized**: Redis caching and database optimization

## 🏗️ Architecture

### Frontend (Vue.js 3 + TypeScript)
- **Framework**: Vue.js 3 with Composition API
- **State Management**: Pinia for reactive state management
- **Styling**: Tailwind CSS with custom components
- **Charts**: Chart.js for data visualization
- **Build Tool**: Vite for fast development and builds

### Backend (FastAPI + Python)
- **Framework**: FastAPI for high-performance async API
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Caching**: Redis for performance optimization
- **Real-time**: WebSockets for live data streaming
- **Authentication**: JWT tokens with secure implementation

### Infrastructure
- **Development**: Docker Compose for local environment
- **Database**: PostgreSQL with time-series optimization
- **Cache**: Redis for session and data caching
- **Deployment**: Production-ready configurations

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.9+
- Docker and Docker Compose
- PostgreSQL 14+
- Redis 6+

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd realtime-analytics-dashboard
```

### 2. Start Development Environment
```bash
# Start all services with Docker Compose
docker-compose up -d

# Or run services individually (see detailed setup below)
```

### 3. Install Dependencies

#### Backend Setup
```bash
cd backend
pip install poetry
poetry install
poetry shell
```

#### Frontend Setup
```bash
cd frontend
npm install
# or
yarn install
```

### 4. Initialize Database
```bash
cd backend
python -m app.scripts.init_db
python -m app.scripts.seed_data
```

### 5. Start Development Servers

#### Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm run dev
# or
yarn dev
```

## 📚 Detailed Setup

### Backend Development Setup

1. **Install Poetry (Python Dependency Manager)**
   ```bash
   pip install poetry
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   poetry install
   poetry shell
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up -d postgres redis
   
   # Run migrations
   alembic upgrade head
   
   # Seed sample data
   python -m app.scripts.seed_data
   ```

5. **Start Backend Server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Development Setup

1. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🐳 Docker Development

### Full Stack with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Individual Service Management
```bash
# Start only database services
docker-compose up -d postgres redis

# Start backend
docker-compose up -d api

# Start frontend
docker-compose up -d frontend
```

## 📊 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Token refresh

#### Analytics Data
- `GET /api/v1/analytics/sales` - Sales metrics
- `GET /api/v1/analytics/users` - User analytics
- `GET /api/v1/analytics/performance` - Performance data

#### Real-time WebSocket
- `WS /api/v1/ws/analytics` - Real-time data stream

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/analytics_db
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME="Real-time Analytics Dashboard"
```

#### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_APP_NAME="Analytics Dashboard"
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
poetry run pytest
poetry run pytest --cov=app tests/
```

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:coverage
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 📈 Performance Optimization

- **Database**: Indexed queries and connection pooling
- **Caching**: Redis for frequently accessed data
- **Frontend**: Code splitting and lazy loading
- **Real-time**: Optimized WebSocket message handling

## 🔒 Security Features

- JWT-based authentication
- Input validation and sanitization
- SQL injection prevention
- XSS protection with CSP headers
- Rate limiting on API endpoints
- CORS configuration

## 📱 Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
poetry build
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- FastAPI team for the high-performance Python framework
- Chart.js for beautiful data visualizations
- Tailwind CSS for utility-first styling
