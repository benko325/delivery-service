-- Initialize schemas for each module (single database, separate schemas approach)

-- Auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Customers schema
CREATE SCHEMA IF NOT EXISTS customers;

-- Restaurants schema
CREATE SCHEMA IF NOT EXISTS restaurants;

-- Drivers schema
CREATE SCHEMA IF NOT EXISTS drivers;

-- Carts schema
CREATE SCHEMA IF NOT EXISTS carts;

-- Orders schema
CREATE SCHEMA IF NOT EXISTS orders;

-- Grant privileges
GRANT ALL PRIVILEGES ON SCHEMA auth TO admin;
GRANT ALL PRIVILEGES ON SCHEMA customers TO admin;
GRANT ALL PRIVILEGES ON SCHEMA restaurants TO admin;
GRANT ALL PRIVILEGES ON SCHEMA drivers TO admin;
GRANT ALL PRIVILEGES ON SCHEMA carts TO admin;
GRANT ALL PRIVILEGES ON SCHEMA orders TO admin;
