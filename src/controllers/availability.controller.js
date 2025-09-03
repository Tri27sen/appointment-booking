const Availability = require('../models/availability.model');
const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');

class AvailabilityController {
  static async setAvailability(req, res, next) {
    try {
      const { timeSlots } = req.body;
console.log('Received timeSlots:', timeSlots);
      console.log('Received timeSlots:', req.body);  
      if (!timeSlots || !Array.isArray(timeSlots) ) {
        return res.status(400).json({ error: 'Time slots array required' });
      }

      const results = await Availability.createMultiple(req.user.userId, timeSlots);

      res.status(201).json({
        message: 'Availability set successfully',
        availability: results
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfessorAvailability(req, res, next) {
    try {
      const professorId = req.params.professorId;
      const professor = await User.findById(professorId);
      if (!professor || professor.role !== 'professor') {
        return res.status(404).json({ error: 'Professor not found' });
      }
      const bookedAvailabilityIds = await Appointment.getBookedAvailabilityIds(professorId);
      const availableSlots = await Availability.findAvailableSlots(professorId, bookedAvailabilityIds);
      res.json({
        professor: {
          id: professor._id,
          username: professor.username
        },
        availableSlots
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AvailabilityController;