const { ObjectId } = require('mongodb');
const db = require('../config/db');


//professor declares free time → stored as available → students book → system marks it unavailable 
//Professor sets availability → Student books → System updates slot (marks unavailable).
class Availability {
  static async create(availabilityData) {
    const { professorId, startTime, endTime } = availabilityData;
    
    if (!professorId || !startTime || !endTime) {
      throw new Error('Professor ID, start time, and end time are required');
    }

    const availability = {
      professorId: new ObjectId(professorId),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isAvailable: true,
      createdAt: new Date()
    };

    const result = await db.availability.insertOne(availability);
    return { ...availability, _id: result.insertedId };
  }

  static async createMultiple(professorId, timeSlots) {
    const results = [];
    
    for (const slot of timeSlots) {
      const { startTime, endTime } = slot;
      
      if (!startTime || !endTime) {
        throw new Error('Start time and end time required for each slot');
      }

      try {
        const availability = await this.create({ professorId, startTime, endTime });
        results.push({
          availabilityId: availability._id,
          startTime,
          endTime
        });
      } catch (error) {
        if (error.code === 11000) {
          continue; // Skip duplicate time slots
        }
        throw error;
      }
    }

    return results;
  }

  static async findByProfessorId(professorId) {
    return await db.availability.find({
      professorId: new ObjectId(professorId),
      isAvailable: true
    }).toArray();
  }

  static async findById(availabilityId) {
    return await db.availability.findOne({
      _id: new ObjectId(availabilityId),
      isAvailable: true
    });
  }

  static async findAvailableSlots(professorId, bookedAvailabilityIds = []) {
    const allSlots = await this.findByProfessorId(professorId);
    
    const availableSlots = allSlots
      .filter(slot => !bookedAvailabilityIds.includes(slot._id.toString()))
      .map(slot => ({
        id: slot._id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        professorId: slot.professorId
      }))
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return availableSlots;
  }
}

module.exports = Availability;