#!/bin/bash

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
