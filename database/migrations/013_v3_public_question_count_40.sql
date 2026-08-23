SET NAMES utf8mb4;

-- V3 publishes 40 participant-facing questions (10 areas × 4) while retaining
-- the 50-question source bank in assessment_versions for history and rollback.
UPDATE assessment_track_settings ats
JOIN assessment_tracks t ON t.id = ats.track_id
SET ats.question_count = 40,
    ats.section_count = 10,
    ats.updated_at = NOW()
WHERE t.track_key IN ('personal','newjoiner','manager','executive');
