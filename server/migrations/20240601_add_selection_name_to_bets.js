'use strict';

exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE bets
    ADD COLUMN selection_name VARCHAR NULL DEFAULT NULL;
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE bets
    DROP COLUMN selection_name;
  `);
}; 