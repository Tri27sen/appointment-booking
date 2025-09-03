const { MongoClient } = require('mongodb');
const { MONGODB_URI } = require('./env');

class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async initialize() {
    console.log("Connecting to MongoDB at:", MONGODB_URI);
    this.client = new MongoClient(MONGODB_URI);
    await this.client.connect();
    this.db = this.client.db('appointment_system');
    console.log('Connected to MongoDB');
    console.log("Using database:", this.db.databaseName);

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

    console.log('Database connected and initialized');
  }

  async close() {
    if (this.client) {
      await this.client.close();
    }
  }
}

const db = new Database();
module.exports = db;