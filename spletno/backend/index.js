import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/User.Router.js';
import { reportRouter } from './routes/Report.Router.js';
import { poiRouter } from './routes/Poi.Router.js';
import { connectDB } from './utils/db.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (
    req.header('x-forwarded-proto') !== 'https' && 
    process.env.NODE_ENV === 'production'
  ) {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Database Connection
connectDB(); // Uses your MONGODB_URI from .env

app.use('/api/users', userRoutes);
app.use('/api/poi', poiRouter);
app.use('/api/report', reportRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    auth0Domain: process.env.AUTH0_DOMAIN
  });
});


// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Server Startup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Auth0 Domain: ${process.env.AUTH0_DOMAIN}`);
  console.log(`MongoDB Connected: ${mongoose.connection.readyState === 1 ? '✅' : '❌'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    mongoose.connection.close();
    console.log('Server shut down gracefully');
    process.exit(0);
  });
});