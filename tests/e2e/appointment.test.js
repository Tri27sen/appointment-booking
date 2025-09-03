
const request = require('supertest');
const app = require('../../src/app');
const TestHelpers = require('../helpers/testHelpers');

describe('Appointments E2E Tests', () => {
  let helpers;
  let professorToken;
  let studentToken;
  let professorId;
  let studentId;
  let availabilityId;

  beforeAll(async () => {
    helpers = new TestHelpers(app);
  });

  beforeEach(async () => {
    // Create test professor
    const professor = await helpers.createTestProfessor({
      username: 'prof_appointments'
    });
    const professorLogin = await helpers.loginUser(professor.credentials);
    professorToken = professorLogin.token;
    professorId = professorLogin.user.id;

    // Create test student
    const student = await helpers.createTestStudent({
      username: 'student_appointments'
    });
    const studentLogin = await helpers.loginUser(student.credentials);
    studentToken = studentLogin.token;
    studentId = studentLogin.user.id;

    // Set professor availability
    const timeSlots = helpers.getTestTimeSlots();
    const availabilityResponse = await request(app)
      .post('/api/availability')
      .set('Authorization', helpers.createAuthHeader(professorToken))
      .send({ timeSlots });
    
    availabilityId = availabilityResponse.body.availability[0].availabilityId;
  });

  describe('POST /api/appointments', () => {
    test('should allow student to book an appointment', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', helpers.createAuthHeader(studentToken))
        .send({ availabilityId });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Appointment booked successfully');
      expect(response.body).toHaveProperty('appointment');
      
      const appointment = response.body.appointment;
      expect(appointment).toHaveProperty('id');
      expect(appointment).toHaveProperty('studentId', studentId);
      expect(appointment).toHaveProperty('professorId', professorId);
      expect(appointment).toHaveProperty('professorName', 'prof_appointments');
      expect(appointment).toHaveProperty('status', 'scheduled');
      expect(appointment).toHaveProperty('startTime');
      expect(appointment).toHaveProperty('endTime');
    });

    test('should reject professor trying to book appointment', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', helpers.createAuthHeader(professorToken))
        .send({ availabilityId });

      helpers.validateErrorResponse(response, 403, 'Only students can perform this action');
    });

    test('should reject booking without availability ID', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', helpers.createAuthHeader(studentToken))
        .send({});

      helpers.validateErrorResponse(response, 400, 'Availability ID required');
    });

    test('should reject booking non-existent availability', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', helpers.createAuthHeader(studentToken))
        .send({ availabilityId: fakeId });

      helpers.validateErrorResponse(response, 404, 'Time slot not found or unavailable');
    });

    test('should prevent double booking of same time slot', async () => {
      // First booking
      await request(app)
        .post('/api/appointments')
        .set('Authorization', helpers.createAuthHeader(studentToken))
        .send({ availabilityId });

      // Create another student for second booking attempt
      const student2 = await helpers.createTestStudent({
        username: 'student2_appointments'
      });
      const student2Login = await helpers.loginUser(student2.credentials);
      
      // Attempt second booking
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', helpers.createAuthHeader(student2Login.token))
        .send({ availabilityId });

      helpers.validateErrorResponse(response, 409, 'Time slot already booked');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .send({ availabilityId });

      helpers.validateErrorResponse(response, 401, 'Access token required');
    });
  });

  describe('GET /api/appointments/my-appointments', () => {
    test('should return student appointments', async () => {
      // Book an appointment first
      await request(app)
        .post('/api/appointments')
        .set('Authorization', helpers.createAuthHeader(studentToken))
        .send({ availabilityId });

      // Get appointments
      const response = await request(app)
        .get('/api/appointments/my-appointments')
        .set('Authorization', helpers.createAuthHeader(studentToken));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('appointments');
      expect(response.body.appointments).toHaveLength(1);
      
      const appointment = response.body.appointments[0];
      expect(appointment).toHaveProperty('id');
      expect(appointment).toHaveProperty('status', 'scheduled');
      expect(appointment).toHaveProperty('startTime');
      expect(appointment).toHaveProperty('endTime');
      expect(appointment).toHaveProperty('professorName', 'prof_appointments');
    });

    test('should return empty array for student with no appointments', async () => {
      const response = await request(app)
        .get('/api/appointments/my-appointments')
        .set('Authorization', helpers.createAuthHeader(studentToken));

      expect(response.status).toBe(200);
      expect(response.body.appointments).toHaveLength(0);
    });

    test('should reject professor trying to access student endpoint', async () => {
      const response = await request(app)
        .get('/api/appointments/my-appointments')
        .set('Authorization', helpers.createAuthHeader(professorToken));

      helpers.validateErrorResponse(response, 403, 'Only students can perform this action');
    });
  });

  describe('DELETE /api/appointments/:appointmentId', () => {
    let appointmentId;

    beforeEach(async () => {
      // Book an appointment to cancel
      const bookingResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', helpers.createAuthHeader(studentToken))
        .send({ availabilityId });
      
      appointmentId = bookingResponse.body.appointment.id;
    });

    test('should allow professor to cancel appointment', async () => {
      const response = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set('Authorization', helpers.createAuthHeader(professorToken));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Appointment cancelled successfully');
    });

    test('should reject student trying to cancel appointment', async () => {
      const response = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set('Authorization', helpers.createAuthHeader(studentToken));

      helpers.validateErrorResponse(response, 403, 'Only professors can perform this action');
    });

    test('should return 404 for non-existent appointment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/appointments/${fakeId}`)
        .set('Authorization', helpers.createAuthHeader(professorToken));

      helpers.validateErrorResponse(response, 404, 'Appointment not found or already cancelled');
    });

    test('should not allow cancelling already cancelled appointment', async () => {
      // Cancel once
      await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set('Authorization', helpers.createAuthHeader(professorToken));

      // Try to cancel again
      const response = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set('Authorization', helpers.createAuthHeader(professorToken));

      helpers.validateErrorResponse(response, 404, 'Appointment not found or already cancelled');
    });
  });
});