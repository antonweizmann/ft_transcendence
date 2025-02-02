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

echo "Checking for superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
	print('Creating superuser...')
	User.objects.create_superuser(username='$DJANGO_SUPERUSER_USERNAME', email='$DJANGO_SUPERUSER_EMAIL', password='$DJANGO_SUPERUSER_PASSWORD')
else:
	print('Superuser already exists.')
"

echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000
