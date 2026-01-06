-- Make price column nullable in products table
ALTER TABLE products ALTER COLUMN price DROP NOT NULL;
