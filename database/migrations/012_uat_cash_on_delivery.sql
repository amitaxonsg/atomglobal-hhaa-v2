-- Temporary UAT payment option for client end-to-end testing.
-- This is deliberately controlled by a global setting so it can be disabled
-- immediately after UAT without changing application code.

INSERT INTO global_settings (setting_key, setting_value, is_encrypted, updated_at)
VALUES ('payments.cash_on_delivery_enabled', 'true', 0, NOW())
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), is_encrypted = 0, updated_at = NOW();
