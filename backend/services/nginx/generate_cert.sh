#!/bin/sh

if [[ ! -f /etc/nginx/transcendence.crt || ! -f /etc/nginx/transcendence.key ]]; then
	echo "No SSL certificate found. Generating one..."

	echo "Using Domain: $DOMAIN"
	openssl req -x509 -nodes -days 100 -newkey rsa:2048 -keyout /etc/nginx/certs/transcendence.key \
	-out /etc/nginx/certs/transcendence.crt -subj "/C=DE/O=42/OU=student/CN=$DOMAIN" 2>/dev/null

	echo "SSL certificate generated."
else
	mkdir -p /etc/nginx/certs
	mv -f /etc/nginx/*.crt /etc/nginx/certs/
	mv -f /etc/nginx/*.key /etc/nginx/certs/
	echo "SSL certificate found."
fi
