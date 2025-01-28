#!/bin/bash

echo 'alias dj="python manage.py"' >> ~/.bashrc
echo "Sourcing credentials..."
export POSTGRES_PASSWORD=$(cat $POSTGRES_PASSWORD_FILE)
source /run/secrets/django_superuser

echo "Migrating Django database..."
python manage.py migrate

echo "Creating Django superuser..."
python manage.py createsuperuser --username $DJANGO_SUPERUSER_USERNAME --email $DJANGO_SUPERUSER_EMAIL --noinput
echo "Setting superuser password..."
python manage.py shell -c \
"from django.contrib.auth import get_user_model;\
User = get_user_model();\
user = User.objects.get(username='$DJANGO_SUPERUSER_USERNAME');\
user.set_password('$DJANGO_SUPERUSER_PASSWORD');\
user.save()"

echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000
