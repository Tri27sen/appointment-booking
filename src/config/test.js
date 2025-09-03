
const { MongoClient } = require('mongodb');

class TestDatabase {
  constructor() {
    this.client = null;
    this.db = null;
    this.dbName = 'appointment_system_test';
  }

  async initialize() {
    const uri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017';
    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db(this.dbName);

    // Create collections
    this.users = this.db.collection('users');
    this.availability = this.db.collection('availability');
    this.appointments = this.db.collection('appointments');

    // Create indexes
    await this.users.createIndex({ username: 1 }, { unique: true });
    await this.availability.createIndex({ professorId: 1, startTime: 1, endTime: 1 }, { unique: true });
    await this.appointments.createIndex({ studentId: 1 });
    await this.appointments.createIndex({ professorId: 1 });
    await this.appointments.createIndex({ availabilityId: 1 });

    console.log('Test database connected and initialized');
  }

  async cleanup() {
    // Clear all collections
    await this.users.deleteMany({});
    await this.availability.deleteMany({});
    await this.appointments.deleteMany({});
  }

  async close() {
    if (this.client) {
      await this.client.close();
    }
  }
}

module.exports = TestDatabase;