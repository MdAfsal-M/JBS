const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { apiLimiter } = require('./middleware/rateLimiter');
const dns = require('dns');

// Load environment variables
dotenv.config();

// Prefer IPv4 first to avoid SRV/DNS issues on some networks (MongoDB Atlas)
dns.setDefaultResultOrder('ipv4first');

// Import routes
const authRoutes = require('./routes/auth');
const ownerRoutes = require('./routes/owner');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const internshipRoutes = require('./routes/internships');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const opportunitiesRoutes = require('./routes/opportunities');
const studentOpportunitiesRoutes = require('./routes/studentOpportunities');
const ownerOpportunitiesRoutes = require('./routes/ownerOpportunities');
const studentApplicationsRoutes = require('./routes/studentApplications');
const studentViewRoutes = require('./routes/studentView');
const ownerApplicationsRoutes = require('./routes/ownerApplications');
const notificationsRoutes = require('./routes/notifications');
const ownerJobsRoutes = require('./routes/ownerJobs');

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Rate limiting
app.use('/api/', apiLimiter);

// Enhanced CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port (development)
    if (origin.match(/^https?:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    // Allow your production domain if you have one
    if (process.env.NODE_ENV === 'production' && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // Allow specific domains from environment variable
    const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',') : [];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests explicitly for all routes
app.options('*', cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://mdafsalm33:zMw0Dtluig6Kiw03@cluster0.ypgm4uz.mongodb.net/jbs_database?retryWrites=true&w=majority&appName=Cluster0';
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Helpful on Atlas when DNS/SRV resolution or slow networks cause timeouts
    serverSelectionTimeoutMS: 20000, // 20s
    socketTimeoutMS: 45000, // 45s
    family: 4, // Force IPv4
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/student-opportunities', studentOpportunitiesRoutes);
app.use('/api/owner-opportunities', ownerOpportunitiesRoutes);
app.use('/api/student', studentApplicationsRoutes);
app.use('/api/student-view', studentViewRoutes);
app.use('/api/owner', ownerApplicationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/owner-jobs', ownerJobsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Database health endpoint
app.get('/api/health/db', (req, res) => {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const state = mongoose.connection.readyState;
  const status = state === 1 ? 'connected' : (state === 2 ? 'connecting' : 'not-connected');
  res.json({ db: status, state });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Root health-check route
app.get("/", (req, res) => {
  res.send("✅ JBS Backend is running successfully!");
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Check required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL ERROR: JWT_SECRET environment variable is not set!');
  console.error('   This will cause all authentication to fail.');
  console.error('   Please create a .env file with JWT_SECRET=your_secret_key');
  process.exit(1);
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 JWT_SECRET: ${process.env.JWT_SECRET ? 'Configured' : 'NOT SET'}`);
  console.log(`🗄️  MongoDB: Connected`);
});
