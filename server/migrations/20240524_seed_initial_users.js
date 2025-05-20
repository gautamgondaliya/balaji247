exports.up = function(knex) {
  return knex.raw(`
    -- Insert Super Admin (top of hierarchy)
    WITH super_admin AS (
      INSERT INTO users (
        user_id, name, password, phone, role, is_active
      ) VALUES (
        'UN1',
        'Super Admin',
        '$2a$10$rQnM1.5qB5U5Y5Y5Y5Y5Y.5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', -- hashed 'admin123'
        '9999999999',
        'super_admin',
        true
      ) RETURNING id
    )
    -- Insert Master Admin (reports to Super Admin)
    , master_admin AS (
      INSERT INTO users (
        user_id, name, password, phone, role, parent_id, is_active
      ) 
      SELECT 
        'UN2',
        'Master Admin',
        '$2a$10$rQnM1.5qB5U5Y5Y5Y5Y5Y.5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', -- hashed 'admin123'
        '8888888888',
        'master',
        id,
        true
      FROM super_admin
      RETURNING id
    )
    -- Insert Sub Admin (reports to Master Admin)
    , sub_admin AS (
      INSERT INTO users (
        user_id, name, password, phone, role, parent_id, is_active
      )
      SELECT 
        'UN3',
        'Sub Admin',
        '$2a$10$rQnM1.5qB5U5Y5Y5Y5Y5Y.5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', -- hashed 'admin123'
        '7777777777',
        'sub_admin',
        id,
        true
      FROM master_admin
      RETURNING id
    )
    -- Insert Agent (reports to Sub Admin)
    , agent AS (
      INSERT INTO users (
        user_id, name, password, phone, role, parent_id, is_active
      )
      SELECT 
        'UN4',
        'Agent',
        '$2a$10$rQnM1.5qB5U5Y5Y5Y5Y5Y.5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', -- hashed 'admin123'
        '6666666666',
        'agent',
        id,
        true
      FROM sub_admin
      RETURNING id
    )
    -- Insert Client (reports to Agent)
    , client AS (
      INSERT INTO users (
        user_id, name, password, phone, role, parent_id, is_active
      )
      SELECT 
        'UN5',
        'Client',
        '$2a$10$rQnM1.5qB5U5Y5Y5Y5Y5Y.5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', -- hashed 'admin123'
        '5555555555',
        'client',
        id,
        true
      FROM agent
      RETURNING id
    )
    -- Create wallets for all users
    INSERT INTO wallets (user_id, current_balance, current_exposure, prev_balance, prev_exposure)
    SELECT id, 0.00, 0.00, 0.00, 0.00
    FROM (
      SELECT id FROM super_admin
      UNION ALL
      SELECT id FROM master_admin
      UNION ALL
      SELECT id FROM sub_admin
      UNION ALL
      SELECT id FROM agent
      UNION ALL
      SELECT id FROM client
    ) all_users;
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    -- Delete wallets first due to foreign key constraint
    DELETE FROM wallets 
    WHERE user_id IN (
      SELECT id FROM users 
      WHERE user_id IN ('UN1', 'UN2', 'UN3', 'UN4', 'UN5')
    );

    -- Delete users
    DELETE FROM users 
    WHERE user_id IN ('UN1', 'UN2', 'UN3', 'UN4', 'UN5');
  `);
}; 