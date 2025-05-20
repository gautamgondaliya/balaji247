exports.up = function(knex) {
  return knex.raw(`
    -- Create enum type for user roles
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('client', 'agent', 'sub_admin', 'master', 'super_admin');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    -- Create users table
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL UNIQUE,
      role user_role NOT NULL DEFAULT 'client',
      parent_id UUID REFERENCES users(id),
      is_active BOOLEAN DEFAULT TRUE,
      profile_picture VARCHAR(255),
      last_login TIMESTAMP,
      role_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX users_role_idx ON users(role);
    CREATE INDEX users_parent_id_idx ON users(parent_id);
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    DROP TABLE IF EXISTS users;
    DROP TYPE IF EXISTS user_role;
  `);
}; 