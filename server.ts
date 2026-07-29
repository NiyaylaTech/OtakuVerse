import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDatabase } from './src/config/database';
import healthRouter from './src/routes/health';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const CLIENT_URL = process.env.CLIENT_URL;

// Configure CORS for CLIENT_URL
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, or same-origin requests)
    if (!origin) return callback(null, true);

    if (!CLIENT_URL || CLIENT_URL === '*' || origin === CLIENT_URL) {
      return callback(null, true);
    }

    // Allow local development and deployment preview URLs
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('onrender.com') ||
      origin.includes('run.app')
    ) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register Health Route
app.use('/api', healthRouter);

// Serve production static assets if dist exists
const distPath = path.join(process.cwd(), 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

/**
 * Start Server only after MongoDB successfully connects
 */
async function startServer() {
  try {
    // Step 1: Connect to MongoDB database
    await connectDatabase();

    // Step 2: Listen on 0.0.0.0:PORT
    app.listen(PORT, HOST, () => {
      console.log('============================================');
      console.log(`🚀 OtakuVerse Server running on http://${HOST}:${PORT}`);
      console.log(`🏥 Health check: http://${HOST}:${PORT}/api/health`);
      console.log(`🔗 Configured CLIENT_URL: ${CLIENT_URL || 'Not specified (permissive)'}`);
      console.log('============================================');
    });
  } catch (error: any) {
    console.error('❌ Server failed to start because MongoDB failed to connect.');
    console.error('Error Details:', error.message || error);
    process.exit(1);
  }
}

startServer();
