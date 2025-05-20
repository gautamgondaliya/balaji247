const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const usersController = require('../controllers/users.controller');

// Get all users (admin only)
router.get('/', authenticateToken, usersController.getAllUsers);

// Get user by ID
router.get('/:user_id', authenticateToken, usersController.getUserById);

// Update user
router.put('/:user_id', authenticateToken, usersController.updateUser);

// Update user status (active/inactive)
router.patch('/:user_id/status', authenticateToken, usersController.updateUserStatus);

// Add user role
router.patch('/:user_id/role', authenticateToken, usersController.updateUserRole);

module.exports = router; 