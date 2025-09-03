
const express = require('express');
const AppointmentController = require('../controllers/appointment.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// POST /api/appointments - Student books appointment
router.post('/', 
  authenticateToken, 
  requireRole('student'), 
  AppointmentController.bookAppointment
);

// DELETE /api/appointments/:appointmentId - Professor cancels appointment
router.delete('/:appointmentId', 
  authenticateToken, 
  requireRole('professor'), 
  AppointmentController.cancelAppointment
);

// GET /api/my-appointments - Student views their appointments
router.get('/my-appointments', 
  authenticateToken, 
  requireRole('student'), 
  AppointmentController.getStudentAppointments
);

module.exports = router;