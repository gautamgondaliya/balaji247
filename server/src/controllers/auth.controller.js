const db = require('../db/knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.register = async (req, res) => {
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    phone,
    role,
    is_active,
    profile_picture
  } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  try {
    // Check if user/email already exists
    const existing = await db.raw(
      'SELECT 1 FROM users WHERE email = ? OR username = ? LIMIT 1',
      [email, username]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = `
      INSERT INTO users (username, email, password, first_name, last_name, phone, role, is_active, profile_picture)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id, username, email, first_name, last_name, phone, role, is_active, profile_picture, created_at, updated_at
    `;
    const values = [
      username,
      email,
      hashedPassword,
      first_name || null,
      last_name || null,
      phone || null,
      role || 'user',
      typeof is_active === 'boolean' ? is_active : true,
      profile_picture || null
    ];
    const result = await db.raw(insertQuery, values);
    const user = result.rows[0];
    res.status(201).json(user);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const userResult = await db.raw(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    // Update last_login to NOW()
    await db.raw('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    // Create JWT token (expires in 1 hour)
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    // Remove password from user object before sending
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
}; 