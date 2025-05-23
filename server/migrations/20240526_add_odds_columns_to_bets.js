exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE bets
    ADD COLUMN previous_bet_odds DECIMAL(10,2),
    ADD COLUMN current_bet_odds DECIMAL(10,2)
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