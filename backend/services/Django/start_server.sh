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
if [[ -f /app/static/js/b_main.js ]]; then
	echo "Static files already configured."
else
	echo "Configuring static files..."
	cp /app/static/js/main.js /app/static/js/b_main.js
	sed -i 's|frontend|static|g' /app/static/js/b_main.js
	sed -i 's|pages/|static/pages/|g' /app/static/js/b_main.js
	sed -i 's|`js/${script}`|`static/js/${script}`|g' /app/static/js/b_main.js
	sed -i 's|/languages.json|/static/languages.json|g' /app/static/js/b_main.js
fi

echo "Starting Django server with Daphne..."
exec daphne -b 0.0.0.0 -p 8000 core.asgi:application
