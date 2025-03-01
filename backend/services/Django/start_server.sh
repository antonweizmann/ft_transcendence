#!/bin/bash

set -e

function wait_for_postgres() {
	echo "Waiting for PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
	while ! nc -z "$POSTGRES_HOST" "$POSTGRES_PORT"; do
		echo "PostgreSQL is unavailable - sleeping"
		sleep 2
	done
	echo "PostgreSQL is up - continuing"
}

# Make sure environment variables for the DB are available
# (Make sure POSTGRES_HOST and POSTGRES_PORT are set in your docker-compose or environment)
if [ -z "$POSTGRES_HOST" ]; then
	echo "Error: POSTGRES_HOST is not set"
	exit 1
fi

if [ -z "$POSTGRES_PORT" ]; then
	POSTGRES_PORT=5432
fi


echo 'alias dj="python manage.py"' >> ~/.bashrc
echo "Sourcing credentials..."
export POSTGRES_PASSWORD=$(cat $POSTGRES_PASSWORD_FILE)
source /run/secrets/django_superuser

echo "Migrating Django database..."
python manage.py migrate

echo "Checking for static files..."
if [ -d "/app/static_files" ] && [ "$(ls -A /app/static_files)" ]; then
	echo "Static files already exist."
else
	echo "Collecting static files..."
	python manage.py collectstatic --noinput
fi

echo "Checking for superuser..."
python manage.py createsuperuser --noinput --username ${DJANGO_SUPERUSER_USERNAME} \
	2>/dev/null \
	|| echo "Superuser already exists."

echo "Starting Django server with Daphne..."
exec daphne -b 0.0.0.0 -p 8000 core.asgi:application
