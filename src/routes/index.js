
const express = require('express');
const authRoutes = require('./auth.routes');
const availabilityRoutes = require('./availability.routes');
const appointmentRoutes = require('./appointment.routes');
const healthRoutes = require('./health.routes');

const router = express.Router();

// Mount all route modules
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/availability', availabilityRoutes);
router.use('/appointments', appointmentRoutes);

module.exports = router;