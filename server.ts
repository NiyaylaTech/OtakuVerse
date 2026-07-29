import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './src/config/database';
import healthRouter from './src/routes/health';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// Sanitize CLIENT_URL to ensure it is purely an origin (without path or trailing slashes)
const rawClientUrl = process.env.CLIENT_URL || 'https://anime-site-vnk3.onrender.com';
let clientOrigin = rawClientUrl;
try {
  const parsed = new URL(rawClientUrl);
  clientOrigin = parsed.origin;
} catch (e) {
  clientOrigin = rawClientUrl.split('/')[0] + '//' + (rawClientUrl.split('/')[2] || rawClientUrl).split('/')[0];
}

// Configure CORS for CLIENT_URL
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, or same-origin requests)
    if (!origin) return callback(null, true);

    if (
      !process.env.CLIENT_URL ||
      process.env.CLIENT_URL === '*' ||
      origin === clientOrigin ||
      origin === 'https://anime-site-vnk3.onrender.com'
    ) {
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

// JSON 404 handler for all unmatched API / server routes
app.use((_req, res) => {
  res.status(404).json({
    error: 'API route not found',
  });
});

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
      console.log(`🚀 OtakuVerse API Server running on http://${HOST}:${PORT}`);
      console.log(`🏥 Health check: http://${HOST}:${PORT}/api/health`);
      console.log(`🔗 Allowed CORS origin: ${clientOrigin}`);
      console.log('============================================');
    });
  } catch (error: any) {
    console.error('❌ Server failed to start because MongoDB failed to connect.');
    console.error('Error Details:', error.message || error);
    process.exit(1);
  }
}

startServer();
