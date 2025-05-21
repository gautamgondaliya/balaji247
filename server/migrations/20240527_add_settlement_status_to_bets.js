'use strict';

exports.up = function(knex) {
  return knex.raw(`
    ALTER TABLE bets ADD COLUMN settlement_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (settlement_status IN ('pending', 'yes', 'no'));
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    ALTER TABLE bets DROP COLUMN IF EXISTS settlement_status;
  `);
}; 