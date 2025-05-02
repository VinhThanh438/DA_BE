#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Load environment variables from .env file
if [ -f .env ]; then
  echo "Loading environment variables from .env..."
  source .env
else
  echo ".env file not found!"
  exit 1
fi

# Check required environment variables
if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
  echo "Environment variables DB_NAME and DB_USER must be set in the .env file."
  exit 1
fi

echo "Installing PostgreSQL contrib extensions..."

# Install PostgreSQL contrib (for uuid-ossp, unaccent, etc.)
sudo apt-get update
sudo apt-get install -y postgresql-contrib

# Create uuid-ossp and unaccent extensions
echo "Creating extensions..."
sudo -u postgres psql -d "$DB_NAME" -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
sudo -u postgres psql -d "$DB_NAME" -c 'CREATE EXTENSION IF NOT EXISTS "unaccent";'

# Create table
echo "Creating sample table..."
sudo -u postgres psql -d "$DB_NAME" -c '
CREATE TABLE IF NOT EXISTS your_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL
);
'

# Create index
echo "Creating index..."
sudo -u postgres psql -d "$DB_NAME" -c '
CREATE INDEX IF NOT EXISTS idx_unaccent_name ON your_table (unaccent(name));
'

echo "PostgreSQL setup completed!"
