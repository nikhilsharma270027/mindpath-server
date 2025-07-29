import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env

import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import mongoose from 'mongoose';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';


// 📁 Ensure Uploads Directory Exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!existsSync(uploadsDir)) {
  mkdir(uploadsDir, { recursive: true })
    .then(() => console.log('Uploads directory created'))
    .catch(err => console.error('Error creating uploads directory:', err));
}

// 🚀 Initialize Express App
const app = express();
app.set('trust proxy', 1); // Trust first proxy (useful if behind reverse proxy)

// 🛡️ Middleware Setup

// Enable CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  })
);

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from /public
app.use(express.static('public'));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Apply Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // max requests per window per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 56,
});
app.use(limiter);

// 🔌 Routes
app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Welcome to the MindPath API' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


//  Global Error Handler

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 🚦 Start Server

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
