import http from 'http';
import fs from 'fs';
import path from 'path';
import app from './app.js';
import { connectDB } from './config/db.js';
import { env, validateProductionEnv } from './config/env.js';
import { initSocket } from './sockets/index.js';

async function start() {
  validateProductionEnv();
  const uploadRoot = env.uploadDir || path.join(process.cwd(), 'uploads');
  fs.mkdirSync(uploadRoot, { recursive: true });

  await connectDB();
  const server = http.createServer(app);
  initSocket(server);
  const host = '0.0.0.0';
  server.listen(env.port, host, () => {
    console.log(`Server running on ${host}:${env.port} (${env.nodeEnv})`);
    console.log(`API: http://localhost:${env.port}/api/v1`);
    console.log(`CORS origins: ${env.clientUrls.join(', ')}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
