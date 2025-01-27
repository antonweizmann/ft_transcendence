#!/bin/bash

alias dj="python manage.py"
echo "Sourcing credentials..."
export POSTGRES_PASSWORD=$(cat $POSTGRES_PASSWORD_FILE)
echo "Migrating Django database..."
python manage.py migrate
echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000
