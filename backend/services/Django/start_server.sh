#!/bin/bash

echo 'alias dj="python manage.py"' >> ~/.bashrc
echo "Sourcing credentials..."
export POSTGRES_PASSWORD=$(cat $POSTGRES_PASSWORD_FILE)
source /run/secrets/django_superuser

echo "Migrating Django database..."
python manage.py migrate

echo "Checking for static files..."
if [[ ! -d /app/static_files ]]; then
	echo "Collecting static files..."
	python manage.py collectstatic --noinput
else
	echo "Static files already exist."
fi

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

echo "Starting Django server with Daphne..."
exec daphne -b 0.0.0.0 -p 8000 core.asgi:application
