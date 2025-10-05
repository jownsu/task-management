import morgan from 'morgan';
import { config } from '@/config/environment';

// Custom token for request ID
morgan.token('id', (req: any) => req.id);

// Custom format for development
const devFormat = ':method :url :status :response-time ms - :res[content-length]';

// Custom format for production
const prodFormat = ':remote-addr :id :method :url :status :response-time ms :res[content-length]';

export const logger = morgan(
  config.nodeEnv === 'production' ? prodFormat : devFormat,
  {
    skip: (req, res) => {
      // Skip logging for health checks
      return req.url === '/health';
    },
  }
);
