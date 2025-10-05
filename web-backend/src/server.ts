import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '@/config/environment';
import {
  corsMiddleware,
  rateLimiter,
  errorHandler,
  notFoundHandler,
  logger,
  requestId,
} from '@/middleware';
import routes from '@/routes';

class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = Number(config.port);
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // Request ID middleware
    this.app.use(requestId);
    
    // Logging middleware
    this.app.use(logger);
    
    // CORS middleware
    this.app.use(corsMiddleware);
    
    // Rate limiting middleware
    this.app.use(rateLimiter);
    
    // Compression middleware
    this.app.use(compression());
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private initializeRoutes(): void {
    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Task Management API Server',
        version: config.api.version,
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          readiness: '/ready',
          api: config.api.prefix,
        },
      });
    });

    // API routes
    this.app.use(config.api.prefix, routes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`
🚀 Server is running!
📍 Port: ${this.port}
🌍 Environment: ${config.nodeEnv}
🔗 API Base URL: http://localhost:${this.port}${config.api.prefix}
📊 Health Check: http://localhost:${this.port}/health
✅ Readiness Check: http://localhost:${this.port}/ready
      `);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Create and start server
const server = new Server();
server.start();

export default server;
