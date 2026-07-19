# Backup and restore

Back up the database daily and before every release. Back up `STORAGE_PATH/uploads` and `STORAGE_PATH/reports` separately. Encrypt backups, copy them off the VPS, restrict access and test restoration quarterly.

To restore, place the site in maintenance mode, take a final safety backup, restore the selected SQL dump into a clean database, restore matching storage files, deploy the matching application release, run health checks, then remove maintenance mode. Document the recovery point and any data created after it.
