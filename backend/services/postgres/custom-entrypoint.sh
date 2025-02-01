#!/bin/bash
set -e

# Step 1: Let PostgreSQL initialize the data directory if it's empty
if [ -z "$(ls -A /var/lib/postgresql/data)" ]; then
  echo "Initializing PostgreSQL data directory..."
  docker-entrypoint.sh postgres &
  PID=$!

  echo "Waiting for PostgreSQL to initialize..."
  for i in {1..30}; do
    if pg_isready -h localhost -U postgres; then
      echo "PostgreSQL is ready."
      break
    fi
    echo "Attempt $i: PostgreSQL not ready yet. Retrying in 1 second..."
    sleep 1
  done

  # Check if PostgreSQL is ready
  if ! pg_isready -h localhost -U postgres; then
    echo "Error: PostgreSQL did not start within 30 seconds."
    exit 1
  fi

  # Step 2: Replace pg_hba.conf with the custom version
  echo "Replacing pg_hba.conf with custom version..."
  cp /etc/postgresql/custom/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf

  # Step 3: Update postgresql.conf to listen on all interfaces
  echo "Updating postgresql.conf..."
  echo "listen_addresses = '*'" >> /var/lib/postgresql/data/postgresql.conf

  # Step 3: Stop PostgreSQL after initialization
  kill $PID
  wait $PID
fi

# Step 4: Start PostgreSQL with the updated configurations
exec docker-entrypoint.sh postgres
