
const request = require('supertest');
const app = require('../../src/app');
const TestHelpers = require('../helpers/testHelpers');

describe('Availability E2E Tests', () => {
  let helpers;
  let professorToken;
  let studentToken;
  let professorId;

  beforeAll(async () => {
    helpers = new TestHelpers(app);
  });

  beforeEach(async () => {
    // Create test professor
    const professor = await helpers.createTestProfessor({
      username: 'prof_availability'
    });
    const professorLogin = await helpers.loginUser(professor.credentials);
    professorToken = professorLogin.token;
    professorId = professorLogin.user.id;

    // Create test student
    const student = await helpers.createTestStudent({
      username: 'student_availability'
    });
    const studentLogin = await helpers.loginUser(student.credentials);
    studentToken = studentLogin.token;
  });

  describe('POST /api/availability', () => {
    test('should allow professor to set availability', async () => {
      const timeSlots = helpers.getTestTimeSlots();

      const response = await request(app)
        .post('/api/availability')
        .set('Authorization', helpers.createAuthHeader(professorToken))
        .send({ timeSlots });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Availability set successfully');
      expect(response.body).toHaveProperty('availability');
      expect(response.body.availability).toHaveLength(2);
      
      response.body.availability.forEach(slot => {
        expect(slot).toHaveProperty('availabilityId');
        expect(slot).toHaveProperty('startTime');
        expect(slot).toHaveProperty('endTime');
      });
    });

    test('should reject student trying to set availability', async () => {
      const timeSlots = helpers.getTestTimeSlots();

      const response = await request(app)
        .post('/api/availability')
        .set('Authorization', helpers.createAuthHeader(studentToken))
        .send({ timeSlots });

      helpers.validateErrorResponse(response, 403, 'Only professors can perform this action');
    });

    test('should reject request without authentication', async () => {
      const timeSlots = helpers.getTestTimeSlots();

      const response = await request(app)
        .post('/api/availability')
        .send({ timeSlots });

      helpers.validateErrorResponse(response, 401, 'Access token required');
    });
    
    
    test('should handle empty time slots array', async () => {
      const response = await request(app)
        .post('/api/availability')
        .set('Authorization', helpers.createAuthHeader(professorToken))
        .send({ timeSlots: [] });

      expect(response.status).toBe(201);
      expect(response.body.availability).toHaveLength(0);
    });
  });

  describe('GET /api/availability/professors/:professorId', () => {
    test('should return professor availability', async () => {
      // First, set some availability
      const timeSlots = helpers.getTestTimeSlots();
      await request(app)
        .post('/api/availability')
        .set('Authorization', helpers.createAuthHeader(professorToken))
        .send({ timeSlots });

      // Then fetch availability
      const response = await request(app)
        .get(`/api/availability/professors/${professorId}`)
        .set('Authorization', helpers.createAuthHeader(studentToken));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('professor');
      expect(response.body).toHaveProperty('availableSlots');
      expect(response.body.professor).toHaveProperty('username', 'prof_availability');
      expect(response.body.availableSlots).toHaveLength(2);
      
      response.body.availableSlots.forEach(slot => {
        expect(slot).toHaveProperty('id');
        expect(slot).toHaveProperty('startTime');
        expect(slot).toHaveProperty('endTime');
        expect(slot).toHaveProperty('professorId');
      });
    });

    test('should return empty array for professor with no availability', async () => {
      const response = await request(app)
        .get(`/api/availability/professors/${professorId}`)
        .set('Authorization', helpers.createAuthHeader(studentToken));

      expect(response.status).toBe(200);
      expect(response.body.availableSlots).toHaveLength(0);
    });

    test('should return 404 for non-existent professor', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      
      const response = await request(app)
        .get(`/api/availability/professors/${fakeId}`)
        .set('Authorization', helpers.createAuthHeader(studentToken));

      helpers.validateErrorResponse(response, 404, 'Professor not found');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/availability/professors/${professorId}`);

      helpers.validateErrorResponse(response, 401, 'Access token required');
    });
  });
});