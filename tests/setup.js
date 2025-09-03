
const TestDatabase = require('../src/config/test');

let testDb;

// Setup before all tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  
  // Initialize test database
  testDb = new TestDatabase();
  await testDb.initialize();
  
  // Replace the main db instance with test db
  const db = require('../src/config/db');
  db.users = testDb.users;
  db.availability = testDb.availability;
  db.appointments = testDb.appointments;
  db.db = testDb.db;
}, 30000);

// Cleanup after each test
afterEach(async () => {
  if (testDb) {
    await testDb.cleanup();
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (testDb) {
    await testDb.close();
  }
}, 30000);

module.exports = { testDb };