#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="${APP_ROOT:-/var/www/head-heart.atomglobal.com}"
SOURCE_DIR="${SOURCE_DIR:-/srv/head-heart.atomglobal.com/source}"
STORAGE_DIR="${STORAGE_DIR:-/var/lib/head-heart-alignment}"

if [[ $EUID -ne 0 ]]; then echo "Run as root." >&2; exit 1; fi

apt-get update
apt-get install -y nginx mariadb-server php8.2-fpm php8.2-cli php8.2-mysql php8.2-curl php8.2-mbstring php8.2-xml php8.2-gd php8.2-zip unzip rsync curl ca-certificates

install -d -o www-data -g www-data -m 0750 "$APP_ROOT/releases" "$STORAGE_DIR/logs" "$STORAGE_DIR/cache" "$STORAGE_DIR/reports" "$STORAGE_DIR/uploads"
install -d -o root -g www-data -m 0750 /etc/head-heart-alignment

if [[ ! -f /etc/head-heart-alignment/app.env ]]; then
  cp "$SOURCE_DIR/backend/.env.example" /etc/head-heart-alignment/app.env
  chown root:www-data /etc/head-heart-alignment/app.env
  chmod 0640 /etc/head-heart-alignment/app.env
  echo "Edit /etc/head-heart-alignment/app.env before deployment." >&2
fi

ln -sfn /etc/head-heart-alignment/app.env "$SOURCE_DIR/backend/.env"
cp "$SOURCE_DIR/deploy/nginx-example.conf" /etc/nginx/sites-available/head-heart.atomglobal.com
ln -sfn /etc/nginx/sites-available/head-heart.atomglobal.com /etc/nginx/sites-enabled/head-heart.atomglobal.com
nginx -t
echo "Server prerequisites installed. Configure the database and run deploy/update-vps.sh."
