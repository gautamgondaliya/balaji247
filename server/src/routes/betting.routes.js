const express = require('express');
const router = express.Router();
const bettingController = require('../controllers/betting.controller');

// Place a new bet
router.post('/place', bettingController.placeBet);

// Get bet details
router.get('/:bet_id', bettingController.getBetDetails);

// Get user's betting history
router.get('/user/:user_id', bettingController.getUserBets);

// Get all bets grouped by user
router.get('/grouped/all', bettingController.getAllBetsGroupedByUser);

// Cancel a bet
router.post('/:bet_id/cancel', bettingController.cancelBet);

// Update bet odds
router.post('/:bet_id/odds', bettingController.updateBetOdds);

// Settle a bet
router.post('/:bet_id/settle', bettingController.settleBet);

module.exports = router; 