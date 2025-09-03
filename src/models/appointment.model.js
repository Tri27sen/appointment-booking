
const { ObjectId } = require('mongodb');
const db = require('../config/db');

class Appointment {
  static async create(appointmentData) {
    const { studentId, professorId, availabilityId } = appointmentData;
    
    if (!studentId || !professorId || !availabilityId) {
       const error = new Error('Student ID, professor ID, and availability ID are required');
  error.statusCode = 400;
  throw error;
    }

    const appointment = {
      studentId: new ObjectId(studentId),
      professorId: new ObjectId(professorId),
      availabilityId: new ObjectId(availabilityId),
      status: 'scheduled',
      createdAt: new Date()
    };

    const result = await db.appointments.insertOne(appointment);
    return { ...appointment, _id: result.insertedId };
  }

  static async findByAvailabilityId(availabilityId, status = 'scheduled') {
    return await db.appointments.findOne({
      availabilityId: new ObjectId(availabilityId),
      status
    });
  }

  static async findByProfessorId(professorId, status = 'scheduled') {
    return await db.appointments.find({
      professorId: new ObjectId(professorId),
      status
    }).toArray();
  }

  static async findByStudentId(studentId, status = 'scheduled') {
    return await db.appointments.aggregate([
      {
        $match: {
          studentId: new ObjectId(studentId),
          status
        }
      },
      {
        $lookup: {
          from: 'availability',
          localField: 'availabilityId',
          foreignField: '_id',
          as: 'availabilityInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'professorId',
          foreignField: '_id',
          as: 'professorInfo'
        }
      },
      {
        $unwind: '$availabilityInfo'
      },
      {
        $unwind: '$professorInfo'
      },
      {
        $project: {
          id: '$_id',
          status: 1,
          startTime: '$availabilityInfo.startTime',
          endTime: '$availabilityInfo.endTime',
          professorName: '$professorInfo.username',
          createdAt: 1
        }
      },
      {
        $sort: { startTime: 1 }
      }
    ]).toArray();
  }

  static async findById(appointmentId) {
    return await db.appointments.findOne({
      _id: new ObjectId(appointmentId)
    });
  }

  static async cancelAppointment(appointmentId, professorId) {
    const appointment = await db.appointments.findOne({
      _id: new ObjectId(appointmentId),
      professorId: new ObjectId(professorId),
      status: 'scheduled'
    });

    if (!appointment) {
       const error = new Error('Appointment not found or already cancelled');
        error.statusCode = 404; // <-- important
        throw error;
    }

    await db.appointments.updateOne(
      { _id: new ObjectId(appointmentId) },
      { 
        $set: { 
          status: 'cancelled', 
          cancelledAt: new Date() 
        } 
      }
    );

    return appointment;
  }

  static async getBookedAvailabilityIds(professorId) {
    const bookedAppointments = await this.findByProfessorId(professorId);
    return bookedAppointments.map(apt => apt.availabilityId.toString());
  }
}

module.exports = Appointment;