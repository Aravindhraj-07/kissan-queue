import express from 'express';
import http from 'http';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { initSocketIO } from './sockets/socketManager.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ensureDefaultAccounts } from './services/seedService.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';
import centreRoutes from './routes/centreRoutes.js';
import slotRoutes from './routes/slotRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import procurementRoutes from './routes/procurementRoutes.js';
import logisticsRoutes from './routes/logisticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import smsUssdRoutes from './routes/smsUssdRoutes.js';

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = initSocketIO(httpServer);

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'ProcureX Backend API',
    timestamp: new Date().toISOString(),
    env: ENV.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/centres', centreRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', smsUssdRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  await ensureDefaultAccounts();

  httpServer.listen(ENV.PORT, () => {
    console.log(`=======================================================`);
    console.log(`  🌾 ProcureX API Server running on port ${ENV.PORT}`);
    console.log(`  ⚡ Real-Time Socket.IO initialized`);
    console.log(`  🌍 Health: http://localhost:${ENV.PORT}/api/health`);
    console.log(`=======================================================`);
  });
};

startServer();

export { app, httpServer };
