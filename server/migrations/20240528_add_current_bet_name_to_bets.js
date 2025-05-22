exports.up = function(knex) {
  return knex.raw('ALTER TABLE bets ADD COLUMN current_bet_name VARCHAR(255)');
};

exports.down = function(knex) {
  return knex.raw('ALTER TABLE bets DROP COLUMN current_bet_name');
}; 