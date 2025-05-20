const db = require('../db/knex');

// Place a new bet (supports back, lay, yes, no)
exports.placeBet = async (req, res) => {
  const { user_id, amount, bet_type, odds, market_id, bet_category } = req.body;

  if (!user_id || !amount || !bet_type || !odds || !market_id) {
    return res.status(400).json({
      success: false,
      message: 'User ID, amount, bet type, odds, and market ID are required.'
    });
  }

  if (!['back', 'lay', 'yes', 'no'].includes(bet_type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid bet type. Must be back, lay, yes, or no.'
    });
  }

  try {
    const trx = await db.transaction();
    try {
      // Get user's wallet
      const walletResult = await trx.raw(`
        SELECT w.*, u.id as user_db_id 
        FROM wallets w
        JOIN users u ON w.user_id = u.id
        WHERE u.user_id = ?
        FOR UPDATE
      `, [user_id]);

      if (walletResult.rows.length === 0) {
        await trx.rollback();
        return res.status(404).json({
          success: false,
          message: 'Wallet not found.'
        });
      }

      const wallet = walletResult.rows[0];
      const stake = parseFloat(amount);
      const currentBalance = parseFloat(wallet.current_balance);
      const currentExposure = parseFloat(wallet.current_exposure);

      // Calculate liability (same for back/yes, lay/no)
      let liability = stake;
      if (bet_type === 'lay' || bet_type === 'no') {
        liability = stake * (odds - 1);
      }

      // Check for existing open bet on the same market/selection and type
      const existingBetResult = await trx.raw(`
        SELECT * FROM bets
        WHERE user_id = ? AND market_id = ? AND bet_type = ? AND status = 'active'
        ORDER BY created_at DESC LIMIT 1
      `, [wallet.user_db_id, market_id, bet_type]);

      let netted = false;
      let nettedAmount = 0;
      let newExposure = currentExposure;
      let newBalance = currentBalance;
      let betToInsert = true;

      if (existingBetResult.rows.length > 0) {
        const existingBet = existingBetResult.rows[0];
        const existingLiability = (bet_type === 'lay' || bet_type === 'no')
          ? parseFloat(existingBet.stake) * (parseFloat(existingBet.previous_bet_odds) - 1)
          : parseFloat(existingBet.stake);

        if (liability <= existingLiability) {
          // Netting/offsetting: reduce exposure, return difference to wallet
          netted = true;
          nettedAmount = existingLiability - liability;
          newExposure = currentExposure - nettedAmount;
          newBalance = currentBalance + nettedAmount;

          // Mark the existing bet as partially or fully offset/cancelled if needed
          await trx.raw(`
            UPDATE bets SET status = 'offset', updated_at = CURRENT_TIMESTAMP WHERE id = ?
          `, [existingBet.id]);

          // Insert a record for the offsetting bet (optional, for audit)
          await trx.raw(`
            INSERT INTO bets (
              user_id, market_id, stake, previous_bet_odds, current_bet_odds, bet_type, bet_category, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'offset', CURRENT_TIMESTAMP)
          `, [wallet.user_db_id, market_id, stake, odds, odds, bet_type, bet_category || null]);

          // Update wallet
          await trx.raw(`
            UPDATE wallets SET current_balance = ?, current_exposure = ?, balance_updated_at = CURRENT_TIMESTAMP WHERE user_id = ?
          `, [newBalance, newExposure, wallet.user_db_id]);

          betToInsert = false;
        }
        // else: if liability > existingLiability, treat as new bet for the extra amount
      }

      if (betToInsert) {
        // Check if user has enough balance for the liability
        if (currentBalance < liability) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            message: 'Insufficient balance.'
          });
        }
        // Create bet
        const betResult = await trx.raw(`
          INSERT INTO bets (
            user_id,
            market_id,
            stake,
            previous_bet_odds,
            current_bet_odds,
            bet_type,
            bet_category,
            status,
            created_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP
          ) RETURNING *
        `, [wallet.user_db_id, market_id, stake, odds, odds, bet_type, bet_category || null]);

        // Update wallet
        await trx.raw(`
          UPDATE wallets 
          SET 
            current_balance = current_balance - ?,
            current_exposure = current_exposure + ?,
            balance_updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `, [liability, liability, wallet.user_db_id]);

        await trx.commit();
        return res.json({
          success: true,
          message: 'Bet placed successfully',
          data: {
            bet: betResult.rows[0],
            wallet: {
              current_balance: currentBalance - liability,
              current_exposure: currentExposure + liability
            }
          }
        });
      } else {
        await trx.commit();
        return res.json({
          success: true,
          message: 'Bet offset successfully',
          data: {
            netted: true,
            netted_amount: nettedAmount,
            wallet: {
              current_balance: newBalance,
              current_exposure: newExposure
            }
          }
        });
      }
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Place bet error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to place bet.',
      error: err.message
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
    // Implementation will go here
  } catch (err) {
    console.error('Get user bets error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get user bets.',
      error: err.message
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
      const stake = parseFloat(bet.stake);
      const odds = parseFloat(bet.current_bet_odds);
      let liability = stake;
      if (bet.bet_type === 'lay' || bet.bet_type === 'no') {
        liability = stake * (odds - 1);
      }

      // Update bet status
      await trx.raw(`
        UPDATE bets 
        SET 
          status = 'cancelled',
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
      const stake = parseFloat(bet.stake);
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
          status = 'settled',
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
      const stake = parseFloat(bet.stake);

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
          'market_id', b.market_id,
          'stake', b.stake,
          'previous_bet_odds', b.previous_bet_odds,
          'current_bet_odds', b.current_bet_odds,
          'bet_type', b.bet_type,
          'bet_category', b.bet_category,
          'status', b.status,
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