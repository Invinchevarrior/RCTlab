const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');

const app = express();

// security and performance optimization middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// configure compression
app.use(compression({
  level: 6,
  threshold: 10 * 1024, // compress only if the response is larger than 10KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// optimize CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.71.10:3000', 'http://192.168.75.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// optimize static file serving
app.use(express.static('public', {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));
app.use(express.json());

// TODO: Please replace the MongoDB connection string with your cloud MongoDB Atlas connection string
mongoose.connect('mongodb+srv://Peter:N7hPNnnt5UQ_uB6@cluster0.pjpstqp.mongodb.net/RCTlab?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/', (req, res) => {
  res.send('RCTlab API is running');
});

// TODO: API routes for user, problem set, problem records, etc. (You can add more routes as needed)
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// performance monitoring middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) { // log requests that take more than 1 second
      console.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`);
    }
  });
  next();
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// server optimization configuration
const server = app.listen(PORT, HOST, () => {
  server.keepAliveTimeout = 65000; // ensure greater than ALB's timeout
  server.headersTimeout = 66000; // ensure greater than keepAliveTimeout
  console.log(`Server running on http://${HOST}:${PORT}`);
  
  // print all available network interfaces
  const interfaces = require('os').networkInterfaces();
  console.log('Available on:');
  Object.keys(interfaces).forEach((iface) => {
    interfaces[iface].forEach((details) => {
      if (details.family === 'IPv4') {
        console.log(`  http://${details.address}:${PORT}`);
      }
    });
  });
}); 