
const app = require('./app');
const db = require('./config/db');
const { PORT } = require('./config/env');

// Start server
const startServer = async () => {
  try {
    await db.initialize();
    
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
      console.log(` API Documentation:`);
      console.log(`   Health Check: GET http://localhost:${PORT}/api/health`);
      console.log(`   Register: POST http://localhost:${PORT}/api/auth/register`);
      console.log(`   Login: POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   Set Availability: POST http://localhost:${PORT}/api/availability`);
      console.log(`   Get Availability: GET http://localhost:${PORT}/api/availability/professors/:id`);
      console.log(`   Book Appointment: POST http://localhost:${PORT}/api/appointments`);
      console.log(`   Cancel Appointment: DELETE http://localhost:${PORT}/api/appointments/:id`);
      console.log(`   My Appointments: GET http://localhost:${PORT}/api/appointments/my-appointments`);
      console.log(`    Use Postman or curl to test the APIs`);
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('\n Shutting down server...');
  await db.close();
  console.log(' Server shut down successfully');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n Shutting down server...');
  await db.close();
  console.log(' Server shut down successfully');
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

module.exports = { app, db };