const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const app = express();

    // Enable CORS with more permissive settings for development
    app.use(cors({
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }));

    // Handle preflight requests
    app.options(/.*/, cors());
    // Increase JSON and URL-encoded payload size limit (50MB)
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Serve static files
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Routes
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/student', require('./routes/studentRoutes'));
    app.use('/api/company', require('./routes/companyRoutes'));
    app.use('/api/admin', require('./routes/adminRoutes'));
    app.use('/api/upload', require('./routes/uploadRoutes'));

    // Error Handler
    app.use(errorHandler);

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
