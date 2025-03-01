#!/bin/sh

if [ -f default.conf ]; then
	echo Moving default.conf to /etc/nginx/conf.d/default.conf
	mv -f /etc/nginx/default.conf /etc/nginx/conf.d/default.conf
fi

if [ -f /etc/nginx/transcendence.crt ] || [ -f /etc/nginx/transcendence.key ]; then
	echo "Moving certs to /etc/nginx/certs..."
	mv -f /etc/nginx/*.crt /etc/nginx/certs/
	mv -f /etc/nginx/*.key /etc/nginx/certs/
fi

exec nginx -g 'daemon off;'