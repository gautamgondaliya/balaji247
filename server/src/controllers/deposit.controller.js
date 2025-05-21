const db = require('../db/knex');
const { v4: uuidv4 } = require('uuid');

exports.createDepositRequest = async (req, res) => {
  try {
    const { userId, amount, transaction_id } = req.body;
    if (!userId || !transaction_id || !amount) {
      return res.status(400).json({ success: false, message: 'userId, transaction_id, and amount are required.' });
    }
    // Get internal user id
    const userIdResult = await db.raw(
      `SELECT id FROM users WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    if (!userIdResult.rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const internalUserId = userIdResult.rows[0].id;
    const depositId = uuidv4();
    await db.raw(
      `INSERT INTO deposit_requests (id, user_id, transaction_id, amount, status, requested_at, updated_at)
       VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [depositId, internalUserId, transaction_id, amount]
    );
    return res.status(201).json({ success: true, message: 'Deposit request created.', id: depositId });
  } catch (error) {
    console.error('Create deposit request error:', error);
    res.status(500).json({ success: false, message: 'Failed to create deposit request.', error: error.message });
  }
};

exports.getAllDepositRequests = async (req, res) => {
  try {
    const result = await db.raw(`SELECT * FROM deposit_requests ORDER BY requested_at DESC`);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get all deposit requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to get deposit requests.', error: error.message });
  }
};

exports.getDepositRequestsByUser = async (req, res) => {
  try {
    const user_id = req.params.user_id;
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
    const result = await db.raw(
      `SELECT * FROM deposit_requests WHERE user_id = ? ORDER BY requested_at DESC`,
      [internalUserId]
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get deposit requests by user error:', error);
    res.status(500).json({ success: false, message: 'Failed to get deposit requests for user.', error: error.message });
  }
};

exports.updateDepositRequestStatus = async (req, res) => {
  const { deposit_request_id, status } = req.body;
  if (!deposit_request_id || !status || !['accept', 'reject'].includes(status)) {
    return res.status(400).json({ success: false, message: 'deposit_request_id and valid status (accept/reject) are required.' });
  }
  const trx = await db.transaction();
  try {
    // Get the deposit request
    const depositResult = await trx.raw(
      `SELECT * FROM deposit_requests WHERE id = ? FOR UPDATE`,
      [deposit_request_id]
    );
    if (!depositResult.rows.length) {
      await trx.rollback();
      return res.status(404).json({ success: false, message: 'Deposit request not found.' });
    }
    const deposit = depositResult.rows[0];
    if (deposit.status === 'accept' || deposit.status === 'reject') {
      await trx.rollback();
      return res.status(400).json({ success: false, message: 'Deposit request already processed.' });
    }
    // Update deposit_requests status
    await trx.raw(
      `UPDATE deposit_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, deposit_request_id]
    );
    // If accepted, add amount to user's wallet
    if (status === 'accept') {
      // Get wallet
      const walletResult = await trx.raw(
        `SELECT * FROM wallets WHERE user_id = ? FOR UPDATE`,
        [deposit.user_id]
      );
      if (!walletResult.rows.length) {
        await trx.rollback();
        return res.status(404).json({ success: false, message: 'User wallet not found.' });
      }
      const wallet = walletResult.rows[0];
      const newBalance = parseFloat(wallet.current_balance) + parseFloat(deposit.amount);
      await trx.raw(
        `UPDATE wallets SET current_balance = ?, balance_updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [newBalance, wallet.id]
      );
    }
    await trx.commit();
    return res.json({ success: true, message: `Deposit request ${status}ed.` });
  } catch (error) {
    await trx.rollback();
    console.error('Update deposit request status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update deposit request status.', error: error.message });
  }
}; 