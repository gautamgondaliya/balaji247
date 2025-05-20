const db = require('../db/knex');

exports.updateBalance = async (req, res) => {
  const { user_id, amount, type } = req.body;

  if (!user_id || !amount || !type || !['credit', 'debit'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'User ID, amount and type (credit/debit) are required.'
    });
  }

  try {
    const trx = await db.transaction();

    try {
      // First get the user's internal ID
      const userResult = await trx.raw(`
        SELECT id FROM users WHERE user_id = ?
      `, [user_id]);

      if (userResult.rows.length === 0) {
        await trx.rollback();
        return res.status(404).json({
          success: false,
          message: 'User not found.'
        });
      }

      const userId = userResult.rows[0].id;

      // Get current wallet state
      const walletResult = await trx.raw(`
        SELECT * FROM wallets 
        WHERE user_id = ?
        FOR UPDATE
      `, [userId]);

      if (walletResult.rows.length === 0) {
        await trx.rollback();
        return res.status(404).json({
          success: false,
          message: 'Wallet not found.'
        });
      }

      const wallet = walletResult.rows[0];
      const currentBalance = parseFloat(wallet.current_balance);
      const newAmount = parseFloat(amount);

      // Validate debit amount
      if (type === 'debit' && currentBalance < newAmount) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance.'
        });
      }

      // Calculate new balance
      const newBalance = type === 'credit' 
        ? currentBalance + newAmount 
        : currentBalance - newAmount;

      // Update wallet
      const updateResult = await trx.raw(`
        UPDATE wallets 
        SET 
          prev_balance = current_balance,
          current_balance = ?,
          balance_updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        RETURNING *
      `, [newBalance, userId]);

      await trx.commit();

      res.json({
        success: true,
        message: `Balance ${type}ed successfully`,
        data: {
          wallet: {
            current_balance: updateResult.rows[0].current_balance,
            prev_balance: updateResult.rows[0].prev_balance,
            balance_updated_at: updateResult.rows[0].balance_updated_at
          }
        }
      });
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Update balance error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update balance.',
      error: err.message
    });
  }
};

exports.getWalletDetails = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required.'
    });
  }

  try {
    // First get the user's internal ID
    const userResult = await db.raw(`
      SELECT id FROM users WHERE user_id = ?
    `, [user_id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const userId = userResult.rows[0].id;

    const walletResult = await db.raw(`
      SELECT 
        w.*,
        u.user_id as user_identifier,
        u.name as user_name
      FROM wallets w
      JOIN users u ON w.user_id = u.id
      WHERE w.user_id = ?
    `, [userId]);

    if (walletResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found.'
      });
    }

    res.json({
      success: true,
      data: {
        wallet: walletResult.rows[0]
      }
    });
  } catch (err) {
    console.error('Get wallet details error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get wallet details.',
      error: err.message
    });
  }
}; 