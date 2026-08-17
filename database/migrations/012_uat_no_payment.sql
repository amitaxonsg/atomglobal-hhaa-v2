INSERT INTO global_settings (setting_key, setting_value, is_encrypted, updated_at)
VALUES ('system.uat_no_payment_enabled', 'true', 0, NOW())
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), is_encrypted = 0, updated_at = NOW();
