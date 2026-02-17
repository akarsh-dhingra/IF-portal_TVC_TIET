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
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Handle SIGTERM for graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      process.exit(0);
    });

    // Handle SIGINT for graceful shutdown
    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      process.exit(0);
    });

    // Connect to database
    await connectDB();

    const app = express();
     app.set('trust proxy', 1); 
    // Enable CORS with more permissive settings for development
    const allowedOrigins = [
      'http://localhost:3000',
      'https://ifportal-three.vercel.app',
      'https://ifportal.tvctiet.in'
    ];
    
    app.use(cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    }));


    // Handle preflight requests
    //app.options(/.*/, cors());
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
