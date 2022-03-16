# --------------------
# Composer dependencies
# --------------------
FROM composer:2.2.7 as vendor

WORKDIR /app

COPY database/ database/

COPY composer.json composer.lock ./

RUN composer install \
    --prefer-dist \
    --no-dev \
    --no-scripts \
    --no-plugins \
    --no-interaction \
    --ignore-platform-reqs

# --------------------
# Frontend build
# --------------------
FROM node:16.14-alpine as node

COPY package.json package-lock.json webpack.mix.js /app/
COPY resources/js/ /app/resources/js/
COPY resources/sass/ /app/resources/sass/

WORKDIR /app

RUN npm install
RUN npm run production

# --------------------
# PHP-FPM/Nginx via supervisord
# --------------------
FROM php:8.1-fpm-alpine

RUN apk update
RUN apk add \
    openssl \
    nginx \
    supervisor \
    curl \
    libxml2-dev \
    oniguruma-dev \
    && rm -rf /var/cache/apk/

RUN docker-php-ext-install dom bcmath mbstring

WORKDIR /var/www/app

COPY --chown=www-data:www-data . /var/www/app
COPY --chown=www-data:www-data --from=vendor /app/vendor /var/www/app/vendor
COPY --chown=www-data:www-data --from=node /app/public /var/www/app/public
COPY --chown=www-data:www-data --from=node /app/mix-manifest.json /var/www/app/mix-manifest.json

COPY docker/supervisord.conf    /etc/supervisor/conf.d/supervisord.conf
COPY docker/php.ini             /etc/php8/conf.d/50-setting.ini
COPY docker/php-fpm.conf        /etc/php8/php-fpm.conf
COPY docker/nginx.conf          /etc/nginx/nginx.conf

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
HEALTHCHECK --interval=1m --timeout=5s CMD curl --fail http://localhost/ || exit 1
