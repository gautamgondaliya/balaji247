const db = require('../db/knex');
const { v4: uuidv4, v5: uuidv5 } = require('uuid');

// Place a new bet (YES/NO or BACK/LAY)
exports.placeBet = async (req, res) => {
  const { user_id, amount, bet_type, odds, market_id, yes_odd, no_odd, bet_title, runs: bodyRuns, yes_run, no_run } = req.body;
  const runs = bodyRuns !== undefined ? bodyRuns : (yes_run !== undefined ? yes_run : (no_run !== undefined ? no_run : '0'));

  if (!user_id || !amount || !bet_type || !market_id) {
    return res.status(400).json({
      success: false,
      message: 'User ID, amount, bet type, and market ID are required.'
    });
  }

  try {
    const trx = await db.transaction();
    try {
      // 1. Get internal user id
      const userIdResult = await trx.raw(
        `SELECT id FROM users WHERE user_id = ? LIMIT 1`,
        [user_id]
      );
      if (!userIdResult.rows.length) {
        await trx.rollback();
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      const internalUserId = userIdResult.rows[0].id;

      // 2. Get wallet
      const walletResult = await trx.raw(
        `SELECT * FROM wallets WHERE user_id = ? FOR UPDATE`,
        [internalUserId]
      );
      if (!walletResult.rows.length) {
        await trx.rollback();
        return res.status(404).json({ success: false, message: 'User wallet not found.' });
      }
      const wallet = walletResult.rows[0];
      let currentBalance = parseFloat(wallet.current_balance);
      let currentExposure = parseFloat(wallet.current_exposure);
      const stake = parseFloat(amount);

      let liability = 0;
      let potentialWin = 0;
      let potentialLoss = 0;
      let oddType = null;

      // Calculate liability and potential win/loss based on bet type
      if (bet_type === 'yes') {
        const yesOdd = Number(yes_odd);
        if (!yesOdd || isNaN(yesOdd)) {
          await trx.rollback();
          return res.status(400).json({ success: false, message: 'yes_odd is required and must be a number for YES bets.' });
        }
        oddType = yesOdd;
        const finalAmount = (stake / 100) * yesOdd;
        liability = finalAmount;
        potentialWin = finalAmount * 2;
        potentialLoss = finalAmount;
      } else if (bet_type === 'no') {
        const noOdd = Number(no_odd);
        if (!noOdd || isNaN(noOdd)) {
          await trx.rollback();
          return res.status(400).json({ success: false, message: 'no_odd is required and must be a number for NO bets.' });
        }
        oddType = noOdd;
        const finalAmount = (stake / 100) * noOdd;
        liability = finalAmount;
        potentialWin = finalAmount * 2;
        potentialLoss = finalAmount;
      } else if (bet_type === 'back') {
        const betOdds = parseFloat(odds);
        if (!betOdds || isNaN(betOdds)) {
          await trx.rollback();
          return res.status(400).json({ success: false, message: 'odds is required and must be a number for BACK bets.' });
        }
        oddType = betOdds;
        liability = stake;
        potentialWin = stake + betOdds * (stake / 100);
        potentialLoss = stake;
      } else if (bet_type === 'lay') {
        const betOdds = parseFloat(odds);
        if (!betOdds || isNaN(betOdds)) {
          await trx.rollback();
          return res.status(400).json({ success: false, message: 'odds is required and must be a number for LAY bets.' });
        }
        oddType = betOdds;
        liability = (betOdds - 1) * stake;
        potentialWin = stake + betOdds * (stake / 100);
        potentialLoss = stake;
      } else {
        await trx.rollback();
        return res.status(400).json({ success: false, message: 'Invalid bet type. Must be yes, no, back, or lay.' });
      }

      // 3. Check balance
      if (currentBalance < liability) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance.',
          required_balance: liability,
          current_balance: currentBalance
        });
      }

      let offsettingDone = false;
      let betId = uuidv4();
      let finalLiability = liability;

      // --- YES/NO Reverse Betting Logic ---
      if ((bet_type === 'yes' || bet_type === 'no') && runs !== undefined && runs !== null) {
        const oppositeType = bet_type === 'yes' ? 'no' : 'yes';
        // Find all active opposite bets for same user, market, runs
        const oppositeBetsResult = await trx.raw(
          `SELECT * FROM bets WHERE user_id = ? AND market_id = ? AND runs = ? AND bet_type = ? AND amount > 0 ORDER BY created_at ASC`,
          [internalUserId, market_id, runs, oppositeType]
        );
        const oppositeBets = oppositeBetsResult.rows;
        let remainingAmount = stake;
        let totalRefund = 0;
        let totalPotentialWin = 0;
        let totalPotentialLoss = 0;

        for (const oppBet of oppositeBets) {
          if (remainingAmount <= 0) break;
          const oppAmount = parseFloat(oppBet.amount);
          const offsetAmount = Math.min(remainingAmount, oppAmount);
          const newOppAmount = oppAmount - offsetAmount;

          // Calculate liability for the offset amount (dynamic for YES/NO odds)
          const oppOdd = parseFloat(oppBet.odd_type);
          const refundLiability = oppOdd * (offsetAmount / 100);
          totalRefund += refundLiability;

          // Proportionally reduce potential win/loss
          const offsetRatio = offsetAmount / oppAmount;
          const offsetPotentialWin = parseFloat(oppBet.potential_win) * offsetRatio;
          const offsetPotentialLoss = parseFloat(oppBet.potential_loss) * offsetRatio;
          totalPotentialWin += offsetPotentialWin;
          totalPotentialLoss += offsetPotentialLoss;

          // Update/cancel the opposite bet
          await trx.raw(
            `UPDATE bets SET 
              amount = ?, 
              potential_win = potential_win - ?,
              potential_loss = potential_loss - ?,
              updated_at = CURRENT_TIMESTAMP, 
              bet_type = CASE WHEN ? = 0 THEN 'cancelled' ELSE bet_type END 
             WHERE id = ?`,
            [newOppAmount, offsetPotentialWin, offsetPotentialLoss, newOppAmount, oppBet.id]
          );
          if (newOppAmount === 0) {
            await trx.raw(
              `UPDATE bets SET bet_type = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
              [oppBet.id]
            );
          }
          remainingAmount -= offsetAmount;
        }

        // Refund the exposure for the offset amount
        currentBalance += totalRefund;
        currentExposure -= totalRefund;

        // If there is any remaining amount, insert a new bet and update balance/exposure
        if (remainingAmount > 0) {
          finalLiability = oddType * (remainingAmount / 100);
          currentBalance -= finalLiability;
          currentExposure += finalLiability;
          // Recalculate potential win/loss for the unmatched portion
          let thisPotentialWin = remainingAmount + oddType * (remainingAmount / 100);
          let thisPotentialLoss = remainingAmount;
          await trx.raw(
            `INSERT INTO bets (id, user_id, market_id, amount, bet_type, odd_type, runs, potential_win, potential_loss, current_bet_name, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [betId, internalUserId, market_id, remainingAmount, bet_type, oddType, runs, thisPotentialWin, thisPotentialLoss, bet_title]
          );
        } else {
          finalLiability = 0;
        }
        offsettingDone = true;
      }

      // --- BACK/LAY Reverse Betting Logic ---
      if ((bet_type === 'back' || bet_type === 'lay') && runs !== undefined && runs !== null) {
        const oppositeType = bet_type === 'back' ? 'lay' : 'back';
        const betOdds = parseFloat(odds);
        let remainingAmount = stake;
        let totalRefund = 0;
        let totalPotentialWin = 0;
        let totalPotentialLoss = 0;

        // Find all active opposite bets for same user, market, selection
        const oppositeBetsResult = await trx.raw(
          `SELECT * FROM bets WHERE user_id = ? AND market_id = ? AND bet_type = ? AND amount > 0 ORDER BY created_at ASC`,
          [internalUserId, market_id, oppositeType]
        );
        const oppositeBets = oppositeBetsResult.rows;

        for (const oppBet of oppositeBets) {
          if (remainingAmount <= 0) break;
          const oppAmount = parseFloat(oppBet.amount);
          const offsetAmount = Math.min(remainingAmount, oppAmount);
          const newOppAmount = oppAmount - offsetAmount;

          // Calculate refund liability for the offset amount
          let refundLiability = 0;
          if (oppBet.bet_type === 'lay') {
            refundLiability = (parseFloat(oppBet.odd_type) - 1) * offsetAmount;
          } else {
            refundLiability = offsetAmount;
          }
          totalRefund += refundLiability;

          // Proportionally reduce potential win/loss
          const offsetRatio = offsetAmount / oppAmount;
          const offsetPotentialWin = parseFloat(oppBet.potential_win) * offsetRatio;
          const offsetPotentialLoss = parseFloat(oppBet.potential_loss) * offsetRatio;
          totalPotentialWin += offsetPotentialWin;
          totalPotentialLoss += offsetPotentialLoss;

          // Update/cancel the opposite bet
          await trx.raw(
            `UPDATE bets SET 
              amount = ?, 
              potential_win = potential_win - ?,
              potential_loss = potential_loss - ?,
              updated_at = CURRENT_TIMESTAMP, 
              bet_type = CASE WHEN ? = 0 THEN 'cancelled' ELSE bet_type END 
             WHERE id = ?`,
            [newOppAmount, offsetPotentialWin, offsetPotentialLoss, newOppAmount, oppBet.id]
          );
          if (newOppAmount === 0) {
            await trx.raw(
              `UPDATE bets SET bet_type = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
              [oppBet.id]
            );
          }
          remainingAmount -= offsetAmount;
        }

        // Adjust potential win/loss for the new bet
        potentialWin -= totalPotentialWin;
        potentialLoss -= totalPotentialLoss;

        // Refund the liability for the offset amount
        finalLiability = totalRefund;
        currentBalance += finalLiability;
        currentExposure -= finalLiability;

        // If there is any remaining amount, insert a new bet and update balance/exposure
        if (remainingAmount > 0) {
          let thisLiability = 0;
          let thisPotentialWin = 0;
          let thisPotentialLoss = 0;
          if (bet_type === 'lay') {
            thisLiability = (betOdds - 1) * remainingAmount;
            thisPotentialWin = remainingAmount + betOdds * (remainingAmount / 100);
            thisPotentialLoss = remainingAmount;
            currentBalance -= thisLiability;
            currentExposure += thisLiability;
          } else {
            thisLiability = remainingAmount;
            thisPotentialWin = remainingAmount + betOdds * (remainingAmount / 100);
            thisPotentialLoss = remainingAmount;
            currentBalance -= thisLiability;
            currentExposure += thisLiability;
          }
          finalLiability = thisLiability;
          await trx.raw(
            `INSERT INTO bets (id, user_id, market_id, amount, bet_type, odd_type, runs, potential_win, potential_loss, current_bet_name, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [betId, internalUserId, market_id, remainingAmount, bet_type, oddType, runs, thisPotentialWin, thisPotentialLoss, bet_title]
          );
        } else {
          finalLiability = 0;
        }
        offsettingDone = true;
      }

      if (!offsettingDone) {
        // No offsetting, proceed as usual
        if (bet_type === 'lay') {
          currentBalance = currentBalance - liability;
          currentExposure = currentExposure + liability;
        } else if (bet_type === 'back') {
          currentBalance = currentBalance - stake;
          currentExposure = currentExposure + stake;
        } else {
          currentBalance = currentBalance - liability;
          currentExposure = currentExposure + liability;
        }
        await trx.raw(
          `INSERT INTO bets (id, user_id, market_id, amount, bet_type, odd_type, runs, potential_win, potential_loss, current_bet_name, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [betId, internalUserId, market_id, stake, bet_type, oddType, runs, potentialWin, potentialLoss, bet_title]
        );
      }

      // After offsetting logic for YES/NO bets
      // Calculate how to fund the remaining liability (finalLiability)
      if (finalLiability > 0) {
        if (currentExposure >= finalLiability) {
          // Use exposure only, no wallet deduction
          currentExposure = currentExposure - finalLiability + finalLiability; // net no change
          // currentBalance remains unchanged
        } else {
          // Use all exposure, and the rest from wallet
          const neededFromWallet = finalLiability - currentExposure;
          if (currentBalance < neededFromWallet) {
            await trx.rollback();
            return res.status(400).json({
              success: false,
              message: 'Insufficient balance after using exposure.',
              required_balance: neededFromWallet,
              current_balance: currentBalance
            });
          }
          currentBalance = currentBalance - neededFromWallet;
          currentExposure = 0 + finalLiability;
        }
      }

      // Update wallet
      await trx.raw(
        `UPDATE wallets SET current_balance = ?, current_exposure = ?, balance_updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [currentBalance, currentExposure, wallet.id]
      );

      await trx.commit();

      // Calculate profit/loss for each selection in this market for this user
      let selectionProfitLoss = {};
      if (bet_type === 'back' || bet_type === 'lay') {
        // Get all bets for this user and market
        const userBetsResult = await db.raw(
          `SELECT * FROM bets WHERE user_id = ? AND market_id = ? AND bet_type IN ('back', 'lay')`,
          [internalUserId, market_id]
        );
        const userBets = userBetsResult.rows;
        // Find all unique selections (runs field or selection_name if available)
        const selections = [...new Set(userBets.map(bet => bet.runs))];
        for (const sel of selections) {
          // All bets on this selection
          const winBets = userBets.filter(bet => bet.runs === sel);
          // All bets on other selections
          const loseBets = userBets.filter(bet => bet.runs !== sel);
          // Sum potential win for this selection
          const winAmount = winBets.reduce((sum, bet) => sum + parseFloat(bet.potential_win || 0), 0);
          // Sum all stakes on other selections
          const loseAmount = loseBets.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
          // Sum all stakes on this selection (potential loss)
          const totalStake = winBets.reduce((sum, bet) => sum + parseFloat(bet.amount || 0), 0);
          selectionProfitLoss[sel] = {
            profit: winAmount - loseAmount,
            loss: totalStake
          };
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Bet placed successfully',
        data: {
          new_balance: currentBalance,
          new_exposure: currentExposure,
          liability: finalLiability,
          potential_win: potentialWin,
          potential_loss: potentialLoss,
          bet_id: betId,
          selection_profit_loss: selectionProfitLoss
        }
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Place bet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place bet.',
      error: error.message
    });
  }
};

// Get bet details
exports.getBetDetails = async (req, res) => {
  try {
    // Implementation will go here
  } catch (err) {
    console.error('Get bet details error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get bet details.',
      error: err.message
    });
  }
};

// Get user's betting history
exports.getUserBets = async (req, res) => {
  try {
    // Accept user_id as query or route param
    const user_id = req.query.user_id || req.params.user_id;
    if (!user_id) {
      return res.status(400).json({ success: false, message: 'user_id is required' });
    }

    // Get internal user id
    const userIdResult = await db.raw(
      `SELECT id FROM users WHERE user_id = ? LIMIT 1`,
      [user_id]
    );
    if (!userIdResult.rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const internalUserId = userIdResult.rows[0].id;

    // Get all bets for this user, order by created_at desc
    const betsResult = await db.raw(
      `SELECT * FROM bets WHERE user_id = ? ORDER BY created_at DESC`,
      [internalUserId]
    );

    return res.json({
      success: true,
      data: betsResult.rows
    });
  } catch (error) {
    console.error('Get user bets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user bets.',
      error: error.message
    });
  }
};

// Cancel a bet (reverse betting)
exports.cancelBet = async (req, res) => {
  const { bet_id } = req.params;

  try {
    const trx = await db.transaction();
    try {
      // Get bet details
      const betResult = await trx.raw(`
        SELECT b.*, w.id as wallet_id, w.current_balance, w.current_exposure
        FROM bets b
        JOIN users u ON b.user_id = u.id
        JOIN wallets w ON u.id = w.user_id
        WHERE b.id = ?
        FOR UPDATE
      `, [bet_id]);

      if (betResult.rows.length === 0) {
        await trx.rollback();
        return res.status(404).json({
          success: false,
          message: 'Bet not found.'
        });
      }

      const bet = betResult.rows[0];
      const stake = parseFloat(bet.bet_amount);
      const odds = parseFloat(bet.current_bet_odds);
      let liability = stake;
      if (bet.bet_type === 'lay' || bet.bet_type === 'no') {
        liability = stake * (odds - 1);
      }

      // Update bet status
      await trx.raw(`
        UPDATE bets 
        SET 
          bet_status = 'cancelled',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [bet_id]);

      // Update wallet
      await trx.raw(`
        UPDATE wallets 
        SET 
          current_balance = current_balance + ?,
          current_exposure = current_exposure - ?,
          balance_updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [liability, liability, bet.wallet_id]);

      await trx.commit();

      res.json({
        success: true,
        message: 'Bet cancelled successfully',
        data: {
          bet: {
            id: bet_id,
            status: 'cancelled',
            returned_amount: liability
          }
        }
      });
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Cancel bet error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel bet.',
      error: err.message
    });
  }
};

// Settle a bet (called by result API)
exports.settleBet = async (req, res) => {
  const { bet_id, status } = req.body;

  if (!bet_id || !status || (status !== 'yes' && status !== 'no')) {
    return res.status(400).json({
      success: false,
      message: 'Bet ID and status (yes or no) are required.'
    });
  }

  try {
    const trx = await db.transaction();
    try {
      // Get bet and wallet
      const betResult = await trx.raw(`
        SELECT b.*, w.id as wallet_id, w.current_balance, w.current_exposure, u.id as user_id
        FROM bets b
        JOIN users u ON b.user_id = u.id
        JOIN wallets w ON u.id = w.user_id
        WHERE b.id = ?
        FOR UPDATE
      `, [bet_id]);

      if (betResult.rows.length === 0) {
        await trx.rollback();
        return res.status(404).json({
          success: false,
          message: 'Bet not found.'
        });
      }

      const bet = betResult.rows[0];
      const walletId = bet.wallet_id;
      const userId = bet.user_id;
      const potentialWin = parseFloat(bet.potential_win);
      const potentialLoss = parseFloat(bet.potential_loss);
      let updateWalletQuery, updateWalletParams;
      let adminWalletId = null;

      if (status === 'yes') {
        // User wins: add potentialWin to user wallet, reduce exposure by potentialLoss
        updateWalletQuery = `UPDATE wallets SET current_balance = current_balance + ?, current_exposure = current_exposure - ?, balance_updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        updateWalletParams = [potentialWin, potentialLoss, walletId];
      } else {
        // User loses: add potentialLoss to super_admin wallet, reduce exposure by potentialLoss
        // Find super_admin's wallet
        const adminResult = await trx.raw(`
          SELECT w.id as wallet_id
          FROM users u
          JOIN wallets w ON u.id = w.user_id
          WHERE u.role = 'super_admin'
          LIMIT 1
        `);
        if (adminResult.rows.length === 0) {
          await trx.rollback();
          return res.status(500).json({ success: false, message: 'Super admin wallet not found.' });
        }
        adminWalletId = adminResult.rows[0].wallet_id;
        // Credit super_admin
        await trx.raw(`UPDATE wallets SET current_balance = current_balance + ?, balance_updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [potentialLoss, adminWalletId]);
        // Debit user exposure
        updateWalletQuery = `UPDATE wallets SET current_exposure = current_exposure - ?, balance_updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        updateWalletParams = [potentialLoss, walletId];
      }

      // Update user wallet
      await trx.raw(updateWalletQuery, updateWalletParams);

      // Mark bet as settled
      await trx.raw(`
        UPDATE bets 
        SET settlement_status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [status, bet_id]);

      await trx.commit();

      res.json({
        success: true,
        message: 'Bet settled',
        data: {
          bet: {
            id: bet_id,
            settlement_status: status,
            result: status,
            win_amount: status === 'yes' ? potentialWin : 0,
            loss_amount: status === 'no' ? potentialLoss : 0
          }
        }
      });
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Settle bet error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to settle bet.',
      error: err.message
    });
  }
};

// Update bet odds
exports.updateBetOdds = async (req, res) => {
  const { bet_id, new_odds } = req.body;

  if (!bet_id || !new_odds) {
    return res.status(400).json({
      success: false,
      message: 'Bet ID and new odds are required.'
    });
  }

  try {
    const trx = await db.transaction();

    try {
      // Get bet details
      const betResult = await trx.raw(`
        SELECT b.*, w.id as wallet_id, w.current_balance, w.current_exposure
        FROM bets b
        JOIN users u ON b.user_id = u.id
        JOIN wallets w ON u.id = w.user_id
        WHERE b.id = ?
        FOR UPDATE
      `, [bet_id]);

      if (betResult.rows.length === 0) {
        await trx.rollback();
        return res.status(404).json({
          success: false,
          message: 'Bet not found.'
        });
      }

      const bet = betResult.rows[0];
      const oldOdds = parseFloat(bet.current_bet_odds);
      const newOdds = parseFloat(new_odds);
      const stake = parseFloat(bet.bet_amount);

      // Calculate profit/loss
      let profitLoss = 0;
      if (bet.bet_type === 'back') {
        // For back bets: profit if new odds are higher
        profitLoss = stake * (newOdds - oldOdds);
      } else {
        // For lay bets: profit if new odds are lower
        profitLoss = stake * (oldOdds - newOdds);
      }

      // Update bet odds
      await trx.raw(`
        UPDATE bets 
        SET 
          current_bet_odds = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newOdds, bet_id]);

      // Update wallet if there's profit/loss
      if (profitLoss !== 0) {
        await trx.raw(`
          UPDATE wallets 
          SET 
            current_balance = current_balance + ?,
            current_exposure = current_exposure - ?,
            balance_updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [profitLoss, profitLoss, bet.wallet_id]);
      }

      await trx.commit();

      res.json({
        success: true,
        message: 'Bet odds updated successfully',
        data: {
          bet: {
            id: bet_id,
            previous_odds: oldOdds,
            current_odds: newOdds,
            profit_loss: profitLoss
          }
        }
      });
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Update bet odds error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update bet odds.',
      error: err.message
    });
  }
};

// Get all bets grouped by user
exports.getAllBetsGroupedByUser = async (req, res) => {
  try {
    // Get all users
    const usersResult = await db.raw(`SELECT id, user_id, name FROM users`);
    const users = usersResult.rows;
    const groupedBets = [];
    for (const user of users) {
      const betsResult = await db.raw(
        `SELECT * FROM bets WHERE user_id = ? ORDER BY created_at DESC`,
        [user.id]
      );
      groupedBets.push({
        user_id: user.user_id,
        name: user.name,
        bets: betsResult.rows
      });
    }
    return res.json({
      success: true,
      data: groupedBets
    });
  } catch (error) {
    console.error('Get all bets grouped by user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bets grouped by user.',
      error: error.message
    });
  }
}; 