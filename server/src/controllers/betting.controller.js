const db = require('../db/knex');
const { v4: uuidv4, v5: uuidv5 } = require('uuid');

// Place a new bet (YES/NO bet: deduct yes_odd or no_odd * (amount / 100) from balance, add to exposure)
exports.placeBet = async (req, res) => {
  const { user_id, amount, bet_type, odds, market_id, yes_odd, no_odd } = req.body;

  if (!user_id || !amount || !bet_type || !odds || !market_id) {
    return res.status(400).json({
      success: false,
      message: 'User ID, amount, bet type, odds, and market ID are required.'
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

      let liability = stake;
      if (bet_type === 'yes') {
        const yesOdd = Number(yes_odd);
        if (!yesOdd || isNaN(yesOdd)) {
          await trx.rollback();
          return res.status(400).json({ success: false, message: 'yes_odd is required and must be a number for YES bets.' });
        }
        liability = yesOdd * (stake / 100);
      } else if (bet_type === 'no') {
        const noOdd = Number(no_odd);
        if (!noOdd || isNaN(noOdd)) {
          await trx.rollback();
          return res.status(400).json({ success: false, message: 'no_odd is required and must be a number for NO bets.' });
        }
        liability = noOdd * (stake / 100);
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

      // 4. Offsetting logic for yes/no bets (multi-bet offsetting)
      let oddType = null;
      let runs = null;
      let selection = null;
      if (bet_type === 'no') {
        oddType = no_odd;
        runs = req.body.no_run;
      } else if (bet_type === 'yes') {
        oddType = yes_odd;
        runs = req.body.yes_run;
      } else if (bet_type === 'back' || bet_type === 'lay') {
        oddType = odds;
        // For back/lay, use selection/team/runner if available
        selection = req.body.selection || req.body.team_id || null;
      }

      let offsettingDone = false;
      let betId = uuidv4();
      let finalLiability = liability;
      let newBalance = currentBalance;
      let newExposure = currentExposure;

      // YES/NO offsetting logic (unchanged)
      if ((bet_type === 'yes' || bet_type === 'no') && runs !== undefined && runs !== null) {
        const oppositeType = bet_type === 'yes' ? 'no' : 'yes';
        // Find all active opposite bets for same user, market, runs
        const oppositeBetsResult = await trx.raw(
          `SELECT * FROM bets WHERE user_id = ? AND market_id = ? AND runs = ? AND bet_type = ? AND amount > 0 ORDER BY created_at ASC`,
          [internalUserId, market_id, runs, oppositeType]
        );
        const oppositeBets = oppositeBetsResult.rows;
        let remainingLiability = liability;
        let totalOffset = 0;
        for (const oppBet of oppositeBets) {
          if (remainingLiability <= 0) break;
          const oppAmount = parseFloat(oppBet.amount);
          const offsetAmount = Math.min(remainingLiability, oppAmount);
          const newOppExposure = oppAmount - offsetAmount;
          // Update opposite bet
          await trx.raw(
            `UPDATE bets SET amount = ?, updated_at = CURRENT_TIMESTAMP, bet_type = CASE WHEN ? = 0 THEN 'cancelled' ELSE bet_type END WHERE id = ?`,
            [newOppExposure, newOppExposure, oppBet.id]
          );
          if (newOppExposure === 0) {
            await trx.raw(
              `UPDATE bets SET bet_type = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
              [oppBet.id]
            );
          }
          totalOffset += offsetAmount;
          remainingLiability -= offsetAmount;
        }
        // Refund totalOffset to balance, subtract from exposure
        newBalance = currentBalance + totalOffset;
        newExposure = currentExposure - totalOffset;
        // If there is any remaining liability, insert a new bet and update balance/exposure
        if (remainingLiability > 0) {
          finalLiability = remainingLiability;
          newBalance -= finalLiability;
          newExposure += finalLiability;
          await trx.raw(
            `INSERT INTO bets (id, user_id, market_id, amount, bet_type, odd_type, runs, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [betId, internalUserId, market_id, liability, bet_type, oddType, runs]
          );
        } else {
          finalLiability = 0;
        }
        offsettingDone = true;
      }

      // BACK/LAY offsetting logic
      if ((bet_type === 'back' || bet_type === 'lay') && selection) {
        const oppositeType = bet_type === 'back' ? 'lay' : 'back';
        // For lay, liability = amount * (odds - 1), for back, liability = amount
        const stake = parseFloat(amount);
        const betOdds = parseFloat(odds);
        let thisLiability = bet_type === 'lay' ? stake * (betOdds - 1) : stake;
        // Find all active opposite bets for same user, market, selection
        const oppositeBetsResult = await trx.raw(
          `SELECT * FROM bets WHERE user_id = ? AND market_id = ? AND selection = ? AND bet_type = ? AND amount > 0 ORDER BY created_at ASC`,
          [internalUserId, market_id, selection, oppositeType]
        );
        const oppositeBets = oppositeBetsResult.rows;
        let remainingAmount = stake;
        let totalOffset = 0;
        for (const oppBet of oppositeBets) {
          if (remainingAmount <= 0) break;
          const oppAmount = parseFloat(oppBet.amount);
          const offsetAmount = Math.min(remainingAmount, oppAmount);
          const newOppAmount = oppAmount - offsetAmount;
          // Update opposite bet
          await trx.raw(
            `UPDATE bets SET amount = ?, updated_at = CURRENT_TIMESTAMP, bet_type = CASE WHEN ? = 0 THEN 'cancelled' ELSE bet_type END WHERE id = ?`,
            [newOppAmount, newOppAmount, oppBet.id]
          );
          if (newOppAmount === 0) {
            await trx.raw(
              `UPDATE bets SET bet_type = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
              [oppBet.id]
            );
          }
          totalOffset += offsetAmount;
          remainingAmount -= offsetAmount;
        }
        // Refund totalOffset to balance, subtract from exposure
        // For back: refund offset stake, for lay: refund offset liability
        let offsetLiability = bet_type === 'lay' ? totalOffset * (betOdds - 1) : totalOffset;
        newBalance = currentBalance + offsetLiability;
        newExposure = currentExposure - offsetLiability;
        // If there is any remaining amount, insert a new bet and update balance/exposure
        if (remainingAmount > 0) {
          finalLiability = bet_type === 'lay' ? remainingAmount * (betOdds - 1) : remainingAmount;
          newBalance -= finalLiability;
          newExposure += finalLiability;
          await trx.raw(
            `INSERT INTO bets (id, user_id, market_id, amount, bet_type, odd_type, runs, selection, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [betId, internalUserId, market_id, remainingAmount, bet_type, oddType, runs, selection]
          );
        } else {
          finalLiability = 0;
        }
        offsettingDone = true;
      }

      if (!offsettingDone) {
        // No offsetting, proceed as usual
        newBalance = currentBalance - liability;
        newExposure = currentExposure + liability;
        await trx.raw(
          `INSERT INTO bets (id, user_id, market_id, amount, bet_type, odd_type, runs, selection, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [betId, internalUserId, market_id, liability, bet_type, oddType, runs, selection]
        );
      }

      // Update wallet
      await trx.raw(
        `UPDATE wallets SET current_balance = ?, current_exposure = ?, balance_updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [newBalance, newExposure, wallet.id]
      );

      await trx.commit();
      return res.status(201).json({
        success: true,
        message: 'Bet placed successfully',
        data: {
          new_balance: newBalance,
          new_exposure: newExposure,
          liability: finalLiability,
          bet_id: betId
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
  const { bet_id, result_odds } = req.body;

  if (!bet_id || typeof result_odds === 'undefined') {
    return res.status(400).json({
      success: false,
      message: 'Bet ID and result odds are required.'
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
      const prevOdds = parseFloat(bet.previous_bet_odds);
      const currOdds = parseFloat(result_odds);
      const stake = parseFloat(bet.bet_amount);
      let profitLoss = 0;
      let win = false;

      // Back/Yes: win if result_odds > previous_bet_odds
      // Lay/No: win if result_odds < previous_bet_odds
      if (bet.bet_type === 'back' || bet.bet_type === 'yes') {
        if (currOdds > prevOdds) {
          profitLoss = stake * (currOdds - prevOdds);
          win = true;
        } else {
          profitLoss = -stake * (prevOdds - currOdds);
        }
      } else if (bet.bet_type === 'lay' || bet.bet_type === 'no') {
        if (currOdds < prevOdds) {
          profitLoss = stake * (prevOdds - currOdds);
          win = true;
        } else {
          profitLoss = -stake * (currOdds - prevOdds);
        }
      }

      // Update bet
      await trx.raw(`
        UPDATE bets 
        SET 
          current_bet_odds = ?,
          bet_status = 'settled',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [currOdds, bet_id]);

      // Update client wallet
      await trx.raw(`
        UPDATE wallets 
        SET 
          current_balance = current_balance + ?,
          current_exposure = current_exposure - ABS(?),
          balance_updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [profitLoss, Math.abs(profitLoss), bet.wallet_id]);

      // If client lost, credit the loss to the super admin's wallet
      if (profitLoss < 0) {
        // Find super admin's wallet
        const adminResult = await trx.raw(`
          SELECT w.id as wallet_id
          FROM users u
          JOIN wallets w ON u.id = w.user_id
          WHERE u.role = 'super_admin'
          LIMIT 1
        `);
        if (adminResult.rows.length > 0) {
          const adminWalletId = adminResult.rows[0].wallet_id;
          await trx.raw(`
            UPDATE wallets
            SET current_balance = current_balance + ?,
                balance_updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [Math.abs(profitLoss), adminWalletId]);
        }
      }

      await trx.commit();

      res.json({
        success: true,
        message: 'Bet settled',
        data: {
          bet: {
            id: bet_id,
            status: 'settled',
            previous_odds: prevOdds,
            result_odds: currOdds,
            profit_loss: profitLoss,
            win
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
    // Get all users with their bets
    const result = await db.raw(`
      SELECT 
        u.user_id, u.name, u.role, u.phone, 
        json_agg(json_build_object(
          'bet_id', b.id,
          'market_id', b.match_id,
          'stake', b.bet_amount,
          'previous_bet_odds', b.previous_bet_odds,
          'current_bet_odds', b.current_bet_odds,
          'bet_type', b.bet_type,
          'bet_category', b.bet_category,
          'status', b.bet_status,
          'created_at', b.created_at,
          'updated_at', b.updated_at
        ) ORDER BY b.created_at DESC) AS bets
      FROM users u
      LEFT JOIN bets b ON u.id = b.user_id
      GROUP BY u.user_id, u.name, u.role, u.phone
      ORDER BY u.user_id
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Get all bets grouped by user error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get bets grouped by user.',
      error: err.message
    });
  }
}; 