
const express = require('express');
const AvailabilityController = require('../controllers/availability.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/availability - Professor sets availability
router.post('/', 
  authenticateToken, 
  requireRole('professor'), 
  AvailabilityController.setAvailability
);

// GET /api/professors/:professorId/availability - Get professor's available slots

router.get('/professors/:professorId', 
  authenticateToken, 
  AvailabilityController.getProfessorAvailability
);

module.exports = router;