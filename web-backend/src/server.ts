import app from "./app";
import { config } from "@/config/environment";

const port = Number(config.port);

/**
 * DOCU: Starts the Express server. <br>
 * App configuration is in app.ts for testability. <br>
 * Last Updated: December 10, 2025
 */
app.listen(port, () => {
	console.log(`
🚀 Server is running!
📍 Port: ${port}
🌍 Environment: ${config.nodeEnv}
🔗 API Base URL: http://localhost:${port}${config.api.prefix}
📊 Health Check: http://localhost:${port}/api/health
✅ Readiness Check: http://localhost:${port}/api/ready
	`);
});

export default app;
