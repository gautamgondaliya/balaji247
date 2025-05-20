const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authenticateToken } = require('../middleware/auth');

// Update wallet balance
router.post('/update-balance', authenticateToken, walletController.updateBalance);

// Get wallet details
router.get('/details/:user_id', authenticateToken, walletController.getWalletDetails);

module.exports = router; 