const db = require('../db/knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Function to generate unique user ID
const generateUserId = async () => {
  try {
    // Get the last user_id from the database
    const result = await db.raw(`
      SELECT user_id FROM users 
      WHERE user_id LIKE 'UN%' 
      ORDER BY CAST(SUBSTRING(user_id, 3) AS INTEGER) DESC 
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      return 'UN1'; // First user
    }
    
    // Extract the number from the last user_id and increment
    const lastNumber = parseInt(result.rows[0].user_id.substring(2));
    return `UN${lastNumber + 1}`;
  } catch (err) {
    console.error('Error generating user ID:', err);
    throw err;
  }
};

exports.register = async (req, res) => {
  const {
    name,
    password,
    phone
  } = req.body;

  if (!name || !password || !phone) {
    return res.status(400).json({ 
      success: false,
      message: 'name, password, and phone are required.' 
    });
  }

  try {
    // Check if phone already exists
    const existing = await db.raw(
      'SELECT 1 FROM users WHERE phone = ? LIMIT 1',
      [phone]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number already registered.' 
      });
    }

    // Generate unique user ID
    const userId = await generateUserId();
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = `
      INSERT INTO users (user_id, name, password, phone, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING user_id, name, phone, role, is_active, created_at, updated_at
    `;
    const values = [
      userId,
      name,
      hashedPassword,
      phone,
      'user', // default role
      true    // default is_active
    ];
    const result = await db.raw(insertQuery, values);
    const user = result.rows[0];

    // Create JWT token
    const token = jwt.sign(
      { 
        user_id: user.user_id,
        name: user.name,
        phone: user.phone,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          user_id: user.user_id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at
        },
        token
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed.',
      error: err.message 
    });
  }
};

exports.login = async (req, res) => {
  const { user_id, password } = req.body;
  
  if (!user_id || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'User ID and password are required.' 
    });
  }

  try {
    const userResult = await db.raw(
      'SELECT * FROM users WHERE user_id = ? LIMIT 1',
      [user_id]
    );
    const user = userResult.rows[0];
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials.' 
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials.' 
      });
    }

    // Update last_login to NOW()
    await db.raw('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

    // Create JWT token
    const token = jwt.sign(
      { 
        user_id: user.user_id,
        name: user.name,
        phone: user.phone,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Remove password from user object before sending
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          user_id: user.user_id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          is_active: user.is_active,
          last_login: user.last_login
        },
        token
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Login failed.',
      error: err.message 
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // Get the user_id from the authenticated request
    const user_id = req.user.user_id;

    // Update last_login to track logout time
    await db.raw('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user_id]);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: err.message
    });
  }
}; 