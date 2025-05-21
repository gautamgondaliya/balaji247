'use strict';

exports.up = function(knex) {
  return knex.raw(`
    CREATE TABLE deposit_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      transaction_id VARCHAR(100) NOT NULL,
      amount DECIMAL(12,2) NOT NULL,
      status VARCHAR(10) NOT NULL CHECK (status IN ('accept', 'reject', 'pending')),
      requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX deposit_requests_user_id_idx ON deposit_requests(user_id);
    CREATE INDEX deposit_requests_status_idx ON deposit_requests(status);
    CREATE INDEX deposit_requests_transaction_id_idx ON deposit_requests(transaction_id);
  `);
};

exports.down = function(knex) {
  return knex.raw('DROP TABLE IF EXISTS deposit_requests');
}; 