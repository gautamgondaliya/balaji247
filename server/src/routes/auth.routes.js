const express = require('express');
const controller = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', authenticateToken, controller.logout);

module.exports = router;
