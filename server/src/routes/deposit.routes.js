const express = require('express');
const router = express.Router();
const depositController = require('../controllers/deposit.controller');

// Create a new deposit request
router.post('/', depositController.createDepositRequest);

// Get all deposit requests
router.get('/', depositController.getAllDepositRequests);

// Get deposit requests by user_id (query param)
router.get('/user/:user_id', depositController.getDepositRequestsByUser);

// Update deposit request status (accept/reject)
router.post('/status', depositController.updateDepositRequestStatus);

module.exports = router; 