SET NAMES utf8mb4;

ALTER TABLE assessment_track_settings
  ADD COLUMN intro_offer TEXT NULL AFTER introductory_note,
  ADD COLUMN heart_label VARCHAR(100) NOT NULL DEFAULT 'Heart' AFTER intro_offer,
  ADD COLUMN heart_description VARCHAR(255) NOT NULL DEFAULT 'Feeling, intuition, connection, meaning' AFTER heart_label,
  ADD COLUMN head_label VARCHAR(100) NOT NULL DEFAULT 'Head' AFTER heart_description,
  ADD COLUMN head_description VARCHAR(255) NOT NULL DEFAULT 'Logic, analysis, control, proof' AFTER head_label,
  ADD COLUMN intake_configuration_json JSON NULL AFTER head_description,
  ADD COLUMN allow_not_applicable TINYINT(1) NOT NULL DEFAULT 1 AFTER intake_configuration_json,
  ADD COLUMN allow_answer_notes TINYINT(1) NOT NULL DEFAULT 1 AFTER allow_not_applicable;

ALTER TABLE survey_answers
  MODIFY answer_value TINYINT UNSIGNED NULL,
  ADD COLUMN is_not_applicable TINYINT(1) NOT NULL DEFAULT 0 AFTER answer_value;
