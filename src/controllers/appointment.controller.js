
const Appointment = require('../models/appointment.model');
const Availability = require('../models/availability.model');
const User = require('../models/user.model');

//Professor sets availability → Student books → Appointment.create() saves → getBookedAvailabilityIds excludes that slot → Slot no longer shows up in available slots.
class AppointmentController {
  static async getProfessorAvailability(req, res, next) {
  try {
    const professorId = req.params.professorId;
    if (!professorId) {
      return res.status(400).json({ error: 'Missing professorId parameter' });
    }

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
  static async bookAppointment(req, res, next) {
    try {
      const { availabilityId } = req.body;
      
      if (!availabilityId) {
        return res.status(400).json({ error: 'Availability ID required' });
      }

      const availability = await Availability.findById(availabilityId);
      
      if (!availability) {
        return res.status(404).json({ error: 'Time slot not found or unavailable' });
      }

      const existingAppointment = await Appointment.findByAvailabilityId(availabilityId);
      
      if (existingAppointment) {
        return res.status(409).json({ error: 'Time slot already booked' });
      }

      const professor = await User.findById(availability.professorId);
      const appointment = await Appointment.create({
        studentId: req.user.userId,
        professorId: availability.professorId,
        availabilityId
      });

      res.status(201).json({
        message: 'Appointment booked successfully',
        appointment: {
          id: appointment._id,
          studentId: req.user.userId,
          professorId: availability.professorId,
          professorName: professor.username,
          startTime: availability.startTime,
          endTime: availability.endTime,
          status: 'scheduled'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelAppointment(req, res, next) {
    try {
      const appointmentId = req.params.appointmentId;
      await Appointment.cancelAppointment(appointmentId, req.user.userId);
      res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getStudentAppointments(req, res, next) {
    try {
      const appointments = await Appointment.findByStudentId(req.user.userId);

      res.json({ appointments });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AppointmentController;