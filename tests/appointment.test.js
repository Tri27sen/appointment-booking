const request = require('supertest');
const { MongoClient, ObjectId } = require('mongodb');

// Import the app but don't start the server
process.env.MONGODB_URI = 'mongodb://localhost:27017';
const { app } = require('../server');

describe('MongoDB Appointment Booking System E2E Test', () => {
  let client, testDb;
  let studentA1Token, studentA2Token, professorP1Token;
  let professorP1Id, availabilityIds;
  let appointmentA1Id;

  beforeAll(async () => {
    // Connect to test database
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
    await client.connect();
    testDb = client.db('appointment_system_test');
    
    // Override the app's database connection for testing
    const appModule = require('../server');
    appModule.db.db = testDb;
    appModule.db.users = testDb.collection('users');
    appModule.db.availability = testDb.collection('availability');
    appModule.db.appointments = testDb.collection('appointments');
  });

  beforeEach(async () => {
    // Clear test database
    await testDb.collection('users').deleteMany({});
    await testDb.collection('availability').deleteMany({});
    await testDb.collection('appointments').deleteMany({});
  });

  afterAll(async () => {
    await client.close();
  });

  test('Complete user flow for appointment booking system', async () => {
    // Step 1: Student A1 authenticates
    console.log('Step 1: Registering and authenticating Student A1...');
    
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'studentA1',
        password: 'password123',
        role: 'student'
      })
      .expect(201);

    const studentA1Login = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'studentA1',
        password: 'password123'
      })
      .expect(200);

    studentA1Token = studentA1Login.body.token;
    expect(studentA1Token).toBeDefined();

    // Step 2: Professor P1 authenticates
    console.log('Step 2: Registering and authenticating Professor P1...');
    
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'professorP1',
        password: 'password123',
        role: 'professor'
      })
      .expect(201);

    const professorP1Login = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'professorP1',
        password: 'password123'
      })
      .expect(200);

    professorP1Token = professorP1Login.body.token;
    professorP1Id = professorP1Login.body.user.id;
    expect(professorP1Token).toBeDefined();

    // Step 3: Professor P1 sets availability
    console.log('Step 3: Professor P1 setting availability...');
    
    const availability = await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${professorP1Token}`)
      .send({
        timeSlots: [
          {
            startTime: '2025-09-01T10:00:00.000Z',
            endTime: '2025-09-01T11:00:00.000Z'
          },
          {
            startTime: '2025-09-01T14:00:00.000Z',
            endTime: '2025-09-01T15:00:00.000Z'
          },
          {
            startTime: '2025-09-01T16:00:00.000Z',
            endTime: '2025-09-01T17:00:00.000Z'
          }
        ]
      })
      .expect(201);

    availabilityIds = availability.body.availability.map(slot => slot.availabilityId);
    expect(availabilityIds).toHaveLength(3);

    // Continue with remaining steps...
    // [Rest of the test implementation would go here]
    
    console.log('✅ Test setup completed successfully!');
  });
});