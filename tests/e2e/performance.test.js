
const request = require('supertest');
const app = require('../../src/app');
const TestHelpers = require('../helpers/testHelpers');

describe('Performance E2E Tests', () => {
  let helpers;
  let professorToken;
  let studentToken;
  let professorId;

  beforeAll(async () => {
    helpers = new TestHelpers(app);
  });

  beforeEach(async () => {
    // Create test users
    const professor = await helpers.createTestProfessor({
      username: 'prof_performance'
    });
    const professorLogin = await helpers.loginUser(professor.credentials);
    professorToken = professorLogin.token;
    professorId = professorLogin.user.id;

    const student = await helpers.createTestStudent({
      username: 'student_performance'
    });
    const studentLogin = await helpers.loginUser(student.credentials);
    studentToken = studentLogin.token;
  });

  describe('Bulk Operations Performance', () => {
    test('should handle bulk availability creation efficiently', async () => {
      // Create 50 time slots
      const timeSlots = [];
      const baseDate = new Date();
      
      for (let i = 0; i < 50; i++) {
        const startTime = new Date(baseDate.getTime() + (i * 60 * 60 * 1000)); // Each hour
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
        
        timeSlots.push({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        });
      }

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/availability')
        .set('Authorization', helpers.createAuthHeader(professorToken))
        .send({ timeSlots });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(201);
      expect(response.body.availability.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      console.log(`Bulk availability creation took ${duration}ms for ${timeSlots.length} slots`);
    });

    test('should handle availability lookup with many slots efficiently', async () => {
      // First create many availability slots
      const timeSlots = [];
      const baseDate = new Date();
      
      for (let i = 0; i < 100; i++) {
        const startTime = new Date(baseDate.getTime() + (i * 60 * 60 * 1000));
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        
        timeSlots.push({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        });
      }

      await request(app)
        .post('/api/availability')
        .set('Authorization', helpers.createAuthHeader(professorToken))
        .send({ timeSlots });

      // Now test lookup performance
      const startTime = Date.now();
      
      const response = await request(app)
        .get(`/api/availability/professors/${professorId}`)
        .set('Authorization', helpers.createAuthHeader(studentToken));

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(response.body.availableSlots.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      
      console.log(`Availability lookup took ${duration}ms for ${response.body.availableSlots.length} slots`);
    });
  });

  describe('Concurrent User Operations', () => {
    test('should handle multiple simultaneous API calls', async () => {
      // Create availability first
      const timeSlots = helpers.getTestTimeSlots();
      await request(app)
        .post('/api/availability')
        .set('Authorization', helpers.createAuthHeader(professorToken))
        .send({ timeSlots });

      // Create multiple concurrent requests
      const promises = [];
      
      // Multiple availability lookups
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .get(`/api/availability/professors/${professorId}`)
            .set('Authorization', helpers.createAuthHeader(studentToken))
        );
      }

      // Multiple health checks
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app).get('/api/health')
        );
      }

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All requests should succeed
      results.forEach(result => {
        expect(result.status).toBe(200);
      });

      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      console.log(`${promises.length} concurrent requests completed in ${duration}ms`);
    });
  });

  describe('Response Time Benchmarks', () => {
    test('authentication endpoints should respond quickly', async () => {
      const userData = {
        username: 'speed_test_user',
        password: 'password123',
        role: 'student'
      };

      // Test registration speed
      const regStartTime = Date.now();
      const regResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);
      const regDuration = Date.now() - regStartTime;

      expect(regResponse.status).toBe(201);
      expect(regDuration).toBeLessThan(1000); // Registration should be under 1 second

      // Test login speed
      const loginStartTime = Date.now();
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        });
      const loginDuration = Date.now() - loginStartTime;

      expect(loginResponse.status).toBe(200);
      expect(loginDuration).toBeLessThan(500); // Login should be under 500ms
      
      console.log(`Registration: ${regDuration}ms, Login: ${loginDuration}ms`);
    });
  });
});