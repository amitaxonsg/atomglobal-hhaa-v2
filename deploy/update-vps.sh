#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if systemctl is-active --quiet apache2 2>/dev/null; then
  echo "Detected active Apache service. Using the Apache immutable deployment path."
  exec bash "$SCRIPT_DIR/update-vps-apache.sh" "$@"
fi

if systemctl is-active --quiet httpd 2>/dev/null; then
  echo "Detected active httpd service. Set APACHE_SERVICE=httpd if required."
  APACHE_SERVICE=httpd exec bash "$SCRIPT_DIR/update-vps-apache.sh" "$@"
fi

if systemctl is-active --quiet nginx 2>/dev/null; then
  echo "Detected active Nginx service. Using the Nginx immutable deployment path."
  exec bash "$SCRIPT_DIR/update-vps-nginx.sh" "$@"
fi

echo "No supported active web-server service was detected." >&2
echo "Refusing to start Apache or Nginx automatically because ports 80/443 may already be owned by another process." >&2
echo "Check: systemctl status apache2 nginx; ss -ltnp | grep -E ':(80|443)'" >&2
exit 1
