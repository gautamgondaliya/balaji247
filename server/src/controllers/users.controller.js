const db = require('../db/knex');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Query to get all users with their wallet balances
    const usersResult = await db.raw(`
      SELECT 
        u.id, 
        u.user_id, 
        u.name, 
        u.phone, 
        u.role,
        u.parent_id,
        u.is_active, 
        u.profile_picture,
        u.last_login,
        u.role_updated_at,
        u.created_at,
        u.updated_at,
        json_build_object(
          'current_balance', w.current_balance,
          'current_exposure', w.current_exposure
        ) as wallet
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      data: usersResult.rows
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get users.',
      error: err.message
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  const { user_id } = req.params;

  try {
    // Check if requester is admin/super_admin or the user themselves
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    // Query to get user with wallet balance
    const userResult = await db.raw(`
      SELECT 
        u.id, 
        u.user_id, 
        u.name, 
        u.phone, 
        u.email, 
        u.role, 
        u.is_active, 
        u.created_at,
        u.last_login,
        json_build_object(
          'current_balance', w.current_balance,
          'current_exposure', w.current_exposure
        ) as wallet
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE u.user_id = ?
    `, [user_id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      data: userResult.rows[0]
    });
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get user.',
      error: err.message
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  const { user_id } = req.params;
  const { name, phone, email } = req.body;

  // Validate input
  if (!name && !phone && !email) {
    return res.status(400).json({
      success: false,
      message: 'At least one field (name, phone, email) is required for update.'
    });
  }

  try {
    // Check if requester is admin or super_admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    // Build update query dynamically
    let updateQuery = 'UPDATE users SET updated_at = NOW()';
    const params = [];

    if (name) {
      updateQuery += ', name = ?';
      params.push(name);
    }

    if (phone) {
      updateQuery += ', phone = ?';
      params.push(phone);
    }

    if (email) {
      updateQuery += ', email = ?';
      params.push(email);
    }

    updateQuery += ' WHERE user_id = ? RETURNING *';
    params.push(user_id);

    // Execute update
    const updateResult = await db.raw(updateQuery, params);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully.',
      data: {
        user: updateResult.rows[0]
      }
    });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update user.',
      error: err.message
    });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  const { user_id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'is_active must be a boolean value.'
    });
  }

  try {
    // Check if requester is admin or super_admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Update user status
    const updateResult = await db.raw(`
      UPDATE users 
      SET is_active = ?, updated_at = NOW() 
      WHERE user_id = ? 
      RETURNING id, user_id, name, role, is_active, updated_at
    `, [is_active, user_id]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully.`,
      data: {
        user: updateResult.rows[0]
      }
    });
  } catch (err) {
    console.error('Update user status error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status.',
      error: err.message
    });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  const { user_id } = req.params;
  const { role } = req.body;

  // Valid roles
  const validRoles = ['client', 'admin', 'super_admin'];
  
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Role must be one of: ${validRoles.join(', ')}`
    });
  }

  try {
    // Only super_admin can update roles
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required to update roles.'
      });
    }

    // Update user role
    const updateResult = await db.raw(`
      UPDATE users 
      SET role = ?, updated_at = NOW() 
      WHERE user_id = ? 
      RETURNING id, user_id, name, role, is_active, updated_at
    `, [role, user_id]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully.',
      data: {
        user: updateResult.rows[0]
      }
    });
  } catch (err) {
    console.error('Update user role error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role.',
      error: err.message
    });
  }
}; 