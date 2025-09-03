
class HealthController {
  static async healthCheck(req, res) {
    res.json({ 
      status: 'OK', 
      message: 'Appointment Booking System API',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = HealthController;