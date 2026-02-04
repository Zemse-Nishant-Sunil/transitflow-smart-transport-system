const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const journeyRoutes = require('./routes/journey');
const realtimeRoutes = require('./routes/realtime');
const analyticsRoutes = require('./routes/analytics');
const disruptionRoutes = require('./routes/disruptions');

const feedsRoutes = require('./routes/feeds');
const predictionRoutes = require('./routes/prediction');
const localizationRoutes = require('./routes/localization');
const carbonRoutes = require('./routes/carbon');

const realtimeService = require('./services/realtimeService');
const gtfsRealtimeService = require('./services/gtfsRealtimeService');
const localizationService = require('./services/localizationService');
const crowdPredictor = require('./services/crowdPredictor');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/journey', journeyRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/disruptions', disruptionRoutes);
app.use('/api/feeds', feedsRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/localization', localizationRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/external', require('./routes/external'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('subscribe_journey', (journeyId) => {
        socket.join(`journey_${journeyId}`);
        console.log(`Client ${socket.id} subscribed to journey ${journeyId}`);
    });

    socket.on('unsubscribe_journey', (journeyId) => {
        socket.leave(`journey_${journeyId}`);
        console.log(`Client ${socket.id} unsubscribed from journey ${journeyId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Initialize real-time updates
realtimeService.initialize(io);

// Initialize prediction model (mock)
crowdPredictor.train();

// Optionally register a GTFS-RT feed from env
if (process.env.GTFS_RT_FEED_URL && process.env.GTFS_RT_CITY) {
    console.log('Registering GTFS-RT feed from env');
    gtfsRealtimeService.registerFeed(process.env.GTFS_RT_CITY, process.env.GTFS_RT_FEED_URL, io);
}

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = { app, io };