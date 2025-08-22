// server.js

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

// --- TRUST PROXY (for Render hosting + rate-limiter) ---
app.set('trust proxy', 1);

// --- SECURITY / MIDDLEWARE ---
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// --- CORS CONFIGURATION ---
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['https://jbs1.netlify.app'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // mobile apps or curl
    if (/^https?:\/\/localhost:\d+$/.test(origin)) return callback(null, true); // dev
    if (allowedOrigins.includes(origin)) return callback(null, true); // production frontend
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept','Origin']
}));

// Handle preflight requests
app.options('*', cors());

// --- BODY PARSING ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- RATE LIMITING ---
app.use('/api/', apiLimiter);

// --- DATABASE CONNECTION ---
const mongoUri = process.env.MONGODB_URI || 'your_local_or_default_mongo_uri';
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    family: 4
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- ROUTES ---
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
app.use('/api/student-applications', studentApplicationsRoutes);
app.use('/api/student-view', studentViewRoutes);
app.use('/api/owner-applications', ownerApplicationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/owner-jobs', ownerJobsRoutes);

// --- HEALTH CHECK ENDPOINTS ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/api/health/db', (req, res) => {
  const state = mongoose.connection.readyState;
  const status = state === 1 ? 'connected' : (state === 2 ? 'connecting' : 'not-connected');
  res.json({ db: status, state });
});

// --- ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// --- ROOT ROUTE ---
app.get("/", (req, res) => {
  res.send("✅ JBS Backend is running successfully!");
});

// --- 404 HANDLER ---
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// --- CHECK ENV VARIABLES ---
if (!process.env.JWT_SECRET) {
  console.error('❌ CRITICAL ERROR: JWT_SECRET environment variable is not set!');
  process.exit(1);
}

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 JWT_SECRET: ${process.env.JWT_SECRET ? 'Configured' : 'NOT SET'}`);
});

