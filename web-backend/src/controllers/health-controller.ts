import { Request, Response } from 'express';
import { ResponseHelper } from '@/utils';

export async function healthCheck(req: Request, res: Response): Promise<void> {
  try {
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
      },
    };

    ResponseHelper.success(res, healthData, 'Health check successful');
  } catch (error) {
    ResponseHelper.internalError(res, 'Health check failed');
  }
}

export async function readinessCheck(req: Request, res: Response): Promise<void> {
  try {
    // Add database connectivity check here when database is implemented
    const readinessData = {
      status: 'READY',
      timestamp: new Date().toISOString(),
      services: {
        api: 'OK',
        // database: 'OK', // Uncomment when database is implemented
      },
    };

    ResponseHelper.success(res, readinessData, 'Readiness check successful');
  } catch (error) {
    ResponseHelper.internalError(res, 'Readiness check failed');
  }
}