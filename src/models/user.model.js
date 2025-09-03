const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const db = require('../config/db');

class User {
  static async create(userData) {
    const { username, password, role } = userData;
    
    // Validate required fields
    if (!username || !password || !role) {
      const error = new Error("Username, password, and role required");
      error.statusCode = 400;
      throw error;
    } 

    // Validate role
    if (!['student', 'professor'].includes(role)) {
      const error = new Error("Role must be student or professor");
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = {
      username,
      passwordHash,
      role,
      createdAt: new Date()
    };

    const result = await db.users.insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  static async findByUsername(username) {
    return await db.users.findOne({ username });
  }

  static async findById(userId) {
    return await db.users.findOne({ _id: new ObjectId(userId) });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async findProfessors() {
    return await db.users.find({ role: 'professor' }).toArray();
  }
}

module.exports = User;