'use strict';

/** @type {import('sequelize-cli').Migration} */
exports.up = function(knex) {
  return knex.raw(`
    CREATE TABLE wallets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      current_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      current_exposure DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      prev_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      prev_exposure DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      wallet_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      balance_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX wallets_user_id_idx ON wallets(user_id);
  `);
};

exports.down = function(knex) {
  return knex.raw('DROP TABLE IF EXISTS wallets');
}; 