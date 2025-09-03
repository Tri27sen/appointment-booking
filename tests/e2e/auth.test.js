
const request = require('supertest');
const app = require('../../src/app');
const TestHelpers = require('../helpers/testHelpers');

describe('Authentication E2E Tests', () => {
  let helpers;

  beforeAll(() => {
    helpers = new TestHelpers(app);
  });

  describe('POST /api/auth/register', () => {
    test('should register a new professor successfully', async () => {
      const professorData = {
        username: 'prof_smith',
        password: 'password123',
        role: 'professor'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(professorData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('userId');
    });

    test('should register a new student successfully', async () => {
      const studentData = {
        username: 'student_jane',
        password: 'password123',
        role: 'student'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(studentData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('userId');
    });

    test('should reject registration with invalid role', async () => {
      const invalidData = {
        username: 'invalid_user',
        password: 'password123',
        role: 'admin'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      helpers.validateErrorResponse(response, 400, 'Role must be student or professor');
    });

    test('should reject registration with missing fields', async () => {
      const incompleteData = {
        username: 'incomplete_user'
        // missing password and role
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData);

      helpers.validateErrorResponse(response, 400, 'Username, password, and role are required');
    });

    test('should reject duplicate username', async () => {
      const userData = {
        username: 'duplicate_user',
        password: 'password123',
        role: 'student'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to register same username
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      helpers.validateErrorResponse(response, 409, 'username already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login successfully with valid credentials', async () => {
      // First register a user
      const userData = {
        username: 'login_test_user',
        password: 'password123',
        role: 'professor'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Then login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: userData.username,
          password: userData.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', userData.username);
      expect(response.body.user).toHaveProperty('role', userData.role);
    });

    test('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent_user',
          password: 'wrongpassword'
        });

      helpers.validateErrorResponse(response, 401, 'Invalid credentials');
    });

    test('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'test_user'
          // missing password
        });

      helpers.validateErrorResponse(response, 400, 'Username and password required');
    });
  });
});