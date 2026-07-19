SET NAMES utf8mb4;

UPDATE global_settings
SET setting_value = '/media/brand/atom-global-wordmark-transparent.svg', updated_at = NOW()
WHERE setting_key IN ('branding.logo_url', 'branding.email_logo_url', 'branding.report_logo_url')
  AND setting_value = '/media/brand/atom-global-wordmark.png';

UPDATE branding_revisions
SET settings_json = JSON_SET(settings_json, '$.logoUrl', '/media/brand/atom-global-wordmark-transparent.svg'),
    updated_at = NOW()
WHERE JSON_UNQUOTE(JSON_EXTRACT(settings_json, '$.logoUrl')) = '/media/brand/atom-global-wordmark.png';

UPDATE branding_revisions
SET settings_json = JSON_SET(settings_json, '$.emailLogoUrl', '/media/brand/atom-global-wordmark-transparent.svg'),
    updated_at = NOW()
WHERE JSON_UNQUOTE(JSON_EXTRACT(settings_json, '$.emailLogoUrl')) = '/media/brand/atom-global-wordmark.png';

UPDATE branding_revisions
SET settings_json = JSON_SET(settings_json, '$.reportLogoUrl', '/media/brand/atom-global-wordmark-transparent.svg'),
    updated_at = NOW()
WHERE JSON_UNQUOTE(JSON_EXTRACT(settings_json, '$.reportLogoUrl')) = '/media/brand/atom-global-wordmark.png';

INSERT INTO media_library (
  file_name, storage_path, mime_type, file_size, width, height,
  alt_text, focal_x, focal_y, variants_json, created_at, updated_at
)
SELECT
  'atom-global-wordmark-transparent.svg',
  '/media/brand/atom-global-wordmark-transparent.svg',
  'image/svg+xml',
  0,
  1782,
  412,
  'Atom Global Consulting',
  50,
  50,
  JSON_OBJECT('source', 'repository', 'background', 'transparent'),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM media_library
  WHERE storage_path = '/media/brand/atom-global-wordmark-transparent.svg'
);
