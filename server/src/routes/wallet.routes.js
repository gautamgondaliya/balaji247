const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');

// Update wallet balance
router.post('/update-balance', walletController.updateBalance);

// Get wallet details
router.get('/details/:user_id', walletController.getWalletDetails);

module.exports = router; 