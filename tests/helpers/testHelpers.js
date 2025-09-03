const request = require('supertest');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../src/config/env');

class TestHelpers {
  constructor(app) {
    this.app = app;
    this.baseURL = '/api';
  }

  // Create test users
  async createTestProfessor(userData = {}) {
    const defaultData = {
      username: 'test_professor',
      password: 'password123',
      role: 'professor'
    };
    
    const professorData = { ...defaultData, ...userData };
    
    const response = await request(this.app)
      .post(`${this.baseURL}/auth/register`)
      .send(professorData);
    
    return {
      user: response.body,
      credentials: professorData
    };
  }

  async createTestStudent(userData = {}) {
    const defaultData = {
      username: 'test_student',
      password: 'password123',
      role: 'student'
    };
    
    const studentData = { ...defaultData, ...userData };
    
    const response = await request(this.app)
      .post(`${this.baseURL}/auth/register`)
      .send(studentData);
    
    return {
      user: response.body,
      credentials: studentData
    };
  }

  // Login and get token
  async loginUser(credentials) {
    const response = await request(this.app)
      .post(`${this.baseURL}/auth/login`)
      .send({
        username: credentials.username,
        password: credentials.password
      });
    
    return response.body;
  }

  // Create authorization header
  createAuthHeader(token) {
    return `Bearer ${token}`;
  }

  // Generate test JWT token
  generateTestToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  }

  // Create test availability slots
  getTestTimeSlots() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return [
      {
        startTime: new Date(tomorrow.getTime() + 9 * 60 * 60 * 1000).toISOString(), // 9 AM tomorrow
        endTime: new Date(tomorrow.getTime() + 10 * 60 * 60 * 1000).toISOString()   // 10 AM tomorrow
      },
      {
        startTime: new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000).toISOString(), // 2 PM tomorrow
        endTime: new Date(tomorrow.getTime() + 15 * 60 * 60 * 1000).toISOString()   // 3 PM tomorrow
      }
    ];
  }

  // Wait for async operations
  async wait(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Validate response structure
  validateErrorResponse(response, expectedStatus, expectedError) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('error');
    if (expectedError) {
      expect(response.body.error).toBe(expectedError);
    }
  }

  validateSuccessResponse(response, expectedStatus = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).not.toHaveProperty('error');
  }
}

module.exports = TestHelpers;