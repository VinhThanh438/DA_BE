#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  source .env
else
  echo ".env file not found!"
  exit 1
fi

# Check if the environment variables are loaded
if [ -z "$DB_USER_NAME" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ] || [ -z "$PATH" ]; then
  echo "Missing environment variables!"
  echo "Please ensure that PGUSER, PGPASSWORD, PGDATABASE, PSQL_PATH are set in the .env file."
  exit 1
fi

echo "Running PostgreSQL setup..."

# Create uuid-ossp and unaccent extensions
"$PATH" -U "$DB_USER_NAME" -d "$DB_NAME" -p "$DB_PORT" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
"$PATH" -U "$DB_USER_NAME" -d "$DB_NAME" -p "$DB_PORT" -c "CREATE EXTENSION IF NOT EXISTS \"unaccent\";"

# Create sample table
"$PATH" -U "$DB_USER_NAME" -d "$DB_NAME" -p "$DB_PORT" -c "
CREATE TABLE IF NOT EXISTS your_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL
);
"

# Create unaccent index
"$PATH" -U "$DB_USER_NAME" -d "$DB_NAME" -p "$DB_PORT" -c "CREATE INDEX IF NOT EXISTS idx_unaccent_name ON your_table (unaccent(name));"

echo "PostgreSQL setup completed!"
