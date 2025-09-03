
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { JWT_SECRET } = require('../config/env');

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, password, role } = req.body;
      if(!username || !password || !role) {
        return res.status(400).json({ error: 'Username, password, and role are required' });
      }
      if (!['student', 'professor'].includes(role)) {
        return res.status(400).json({ error: 'Role must be student or professor' });
      }
      const user = await User.create({ username, password, role });
      
      res.status(201).json({
        message: 'User registered successfully',
        userId: user._id
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      console.log('Login attempt for user:', username);

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const user = await User.findByUsername(username);
      
      if (!user || !await User.verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { 
          userId: user._id.toString(), 
          username: user.username, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;