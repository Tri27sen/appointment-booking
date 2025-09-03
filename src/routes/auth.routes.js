
const express = require('express');
const AuthController = require('../controllers/auth.controller');

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', AuthController.register);

// POST /api/auth/login - Login user
router.post('/login', AuthController.login);

module.exports = router;