
const request = require('supertest');
const app = require('../../src/app');

describe('Health Check E2E Tests', () => {
  describe('GET /api/health', () => {
    test('should return API health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message', 'Appointment Booking System API');
      expect(response.body).toHaveProperty('timestamp');
      
      // Verify timestamp is a valid ISO string
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    test('should be accessible without authentication', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
    });
  });

  describe('404 Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Route not found');
      expect(response.body).toHaveProperty('path', '/api/non-existent-route');
    });

    test('should return 404 for non-API routes', async () => {
      const response = await request(app)
        .get('/some-random-path');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});