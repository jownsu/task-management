# Task Management Backend API

A RESTful API backend built with Express.js and TypeScript for the Task Management application.

## 🚀 Features

- **Express.js** with TypeScript
- **RESTful API** design
- **Security** middleware (Helmet, CORS, Rate Limiting)
- **Error handling** with custom error classes
- **Request logging** with Morgan
- **Environment configuration** management
- **Health check** endpoints
- **Structured project** organization

## 📁 Project Structure

```
web-backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers (kebab-case naming)
│   │   ├── board-controller.ts
│   │   ├── subtask-controller.ts
│   │   └── health-controller.ts
│   ├── middleware/      # Custom middleware (kebab-case naming)
│   │   ├── cors.ts
│   │   ├── error-handler.ts
│   │   ├── logger.ts
│   │   ├── rate-limiter.ts
│   │   └── request-id.ts
│   ├── models/          # Data models and interfaces
│   ├── routes/          # API routes (kebab-case naming)
│   │   ├── board-routes.ts
│   │   ├── subtask-routes.ts
│   │   └── health-routes.ts
│   ├── services/        # Business logic services (kebab-case naming)
│   │   └── data-service.ts
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── dist/                # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   Edit `.env` file with your configuration.

3. **Development:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## 🌐 API Endpoints

### Health Check
- `GET /health` - Health check endpoint
- `GET /ready` - Readiness check endpoint

### API Routes
- `GET /api` - API information
- More routes will be added as the application grows

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request rate limiting
- **Request ID** - Unique request tracking
- **Error Handling** - Structured error responses

## 📝 Environment Variables

Copy `env.example` to `.env` and configure:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# API Configuration
API_VERSION=v1
API_PREFIX=/api
```

## 🏗️ Development

The project is structured for scalability and maintainability:

- **Controllers** handle business logic
- **Routes** define API endpoints
- **Models** define data structures
- **Middleware** handles cross-cutting concerns
- **Utils** provide helper functions
- **Types** define TypeScript interfaces

## 🔮 Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Authentication & Authorization (JWT)
- Input validation (Joi/Zod)
- API documentation (Swagger)
- Testing (Jest/Supertest)
- Docker containerization
- CI/CD pipeline

## 📄 License

ISC
