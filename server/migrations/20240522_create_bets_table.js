'use strict';

/** @type {import('sequelize-cli').Migration} */
exports.up = function(knex) {
  return knex.raw(`
    CREATE TABLE bets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      match_id UUID NOT NULL,
      team_id UUID NOT NULL,
      bet_amount DECIMAL(10,2) NOT NULL,
      bet_rate DECIMAL(10,2) NOT NULL,
      potential_win_amount DECIMAL(10,2) NOT NULL,
      potential_loss_amount DECIMAL(10,2) NOT NULL,
      bet_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (bet_status IN ('pending', 'won', 'lost', 'cancelled')),
      bet_placed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      bet_settled_at TIMESTAMP,
      settlement_amount DECIMAL(10,2),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better query performance
    CREATE INDEX bets_user_id_idx ON bets(user_id);
    CREATE INDEX bets_match_id_idx ON bets(match_id);
    CREATE INDEX bets_team_id_idx ON bets(team_id);
    CREATE INDEX bets_status_idx ON bets(bet_status);
  `);
};

exports.down = function(knex) {
  return knex.raw('DROP TABLE IF EXISTS bets');
}; 