'use strict';

exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE bets 
      ADD COLUMN potential_win DECIMAL(12,2),
      ADD COLUMN potential_loss DECIMAL(12,2);
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE bets 
      DROP COLUMN IF EXISTS potential_win,
      DROP COLUMN IF EXISTS potential_loss;
  `);
}; 