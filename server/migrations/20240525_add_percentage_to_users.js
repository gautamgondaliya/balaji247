exports.up = function(knex) {
  return knex.raw(`
    -- Add percentage column
    ALTER TABLE users 
    ADD COLUMN percentage DECIMAL(5,2) DEFAULT 0.00;

    -- Update default percentages based on roles
    UPDATE users 
    SET percentage = 
      CASE role
        WHEN 'super_admin' THEN 5.00
        WHEN 'master' THEN 10.00
        WHEN 'sub_admin' THEN 15.00
        WHEN 'agent' THEN 20.00
        WHEN 'client' THEN 100.00
      END
    WHERE role IN ('super_admin', 'master', 'sub_admin', 'agent', 'client');

    -- Add check constraint to ensure percentage is between 0 and 100
    ALTER TABLE users
    ADD CONSTRAINT check_percentage_range 
    CHECK (percentage >= 0.00 AND percentage <= 100.00);
  `);
};

exports.down = function(knex) {
  return knex.raw(`
    -- Remove check constraint
    ALTER TABLE users
    DROP CONSTRAINT IF EXISTS check_percentage_range;

    -- Remove percentage column
    ALTER TABLE users
    DROP COLUMN IF EXISTS percentage;
  `);
}; 