// Try to load dotenv, but don't fail if it's not installed
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not found, using environment variables or defaults');
}

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'localhost:27017/appointment-booking',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  NODE_ENV: process.env.NODE_ENV || 'development'
};