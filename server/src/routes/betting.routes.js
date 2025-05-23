const express = require('express');
const router = express.Router();
const bettingController = require('../controllers/betting.controller');
const { authenticateToken } = require('../middleware/auth');

// Place a new bet
router.post('/place', authenticateToken, bettingController.placeAllBets);

// Get bet details
router.get('/:bet_id', authenticateToken, bettingController.getBetDetails);

// Get user's betting history
router.get('/user/:user_id', authenticateToken, bettingController.getUserBets);

// Get all bets grouped by user
router.get('/grouped/all', authenticateToken, bettingController.getAllBetsGroupedByUser);

// Cancel a bet
router.post('/:bet_id/cancel', authenticateToken, bettingController.cancelBet);

// Update bet odds
router.post('/:bet_id/odds', authenticateToken, bettingController.updateBetOdds);

// Settle a bet
router.post('/settle', authenticateToken, bettingController.settleBet);

module.exports = router; 