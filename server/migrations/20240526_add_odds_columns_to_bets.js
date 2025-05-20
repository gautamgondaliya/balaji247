exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE bets
    ADD COLUMN previous_bet_odds DECIMAL(10,2),
    ADD COLUMN current_bet_odds DECIMAL(10,2),
    ADD COLUMN bet_type VARCHAR(10) CHECK (bet_type IN ('back', 'lay', 'yes', 'no'));
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE bets
    DROP COLUMN previous_bet_odds,
    DROP COLUMN current_bet_odds,
    DROP COLUMN bet_type;
  `);
}; 