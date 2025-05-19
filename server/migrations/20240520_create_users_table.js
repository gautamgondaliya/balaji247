exports.up = function(knex) {
  return knex.schema.raw(`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(50),
      last_name VARCHAR(50),
      phone VARCHAR(20),
      role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
      is_active BOOLEAN DEFAULT TRUE,
      profile_picture VARCHAR(255),
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
};

exports.down = function(knex) {
  return knex.schema.raw('DROP TABLE IF EXISTS users');
}; 