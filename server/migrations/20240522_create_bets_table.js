'use strict';

/** @type {import('sequelize-cli').Migration} */
exports.up = function(knex) {
  return knex.raw(`
    CREATE TABLE bets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      market_id VARCHAR(20) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      bet_type VARCHAR(10) NOT NULL CHECK (bet_type IN ('yes', 'no', 'back', 'lay', 'cancelled')),
      odd_type VARCHAR(20) NOT NULL,
      runs VARCHAR(20) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX bets_user_id_idx ON bets(user_id);
    CREATE INDEX bets_market_id_idx ON bets(market_id);
    CREATE INDEX bets_bet_type_idx ON bets(bet_type);
  `);
};

exports.down = function(knex) {
  return knex.raw('DROP TABLE IF EXISTS bets');
}; 