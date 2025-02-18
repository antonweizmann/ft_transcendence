#!/bin/sh

if [[ -f default.conf ]]; then
	echo Moving default.conf to /etc/nginx/conf.d/default.conf
	mv -f /etc/nginx/default.conf /etc/nginx/conf.d/default.conf
fi

if [[ ! -f /etc/nginx/certs/transcendence.crt || ! -f /etc/nginx/certs/transcendence.key ]]; then
	echo "No SSL certificate found. Generating one..."

	# for later if we decide to use a real domain
	# certbot certonly --webroot -w /var/www/transcendence --non-interactive --agree-tos --email jfikents@student.42Heilbronn.de -d $DOMAIN
	# mv /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/nginx/certs/transcendence.crt
	# mv /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/nginx/certs/transcendence.key

	echo "Using Domain: $DOMAIN"
	openssl req -x509 -nodes -days 100 -newkey rsa:2048 -keyout /etc/nginx/certs/transcendence.key \
	-out /etc/nginx/certs/transcendence.crt -subj "/C=DE/O=42/OU=student/CN=$DOMAIN" 2>/dev/null

	echo "SSL certificate generated."

else
	echo "SSL certificate found."
fi

exec nginx -g 'daemon off;'