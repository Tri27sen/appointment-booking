const express = require('express');
const HealthController = require('../controllers/health.controller');

const router = express.Router();

// GET /api/health - Health check endpoint
router.get('/', HealthController.healthCheck);

module.exports = router;