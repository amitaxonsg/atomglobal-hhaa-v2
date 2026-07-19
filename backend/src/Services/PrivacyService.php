<?php
declare(strict_types=1);

namespace AtomGlobal\Services;

use AtomGlobal\Database;

final class PrivacyService
{
    public function __construct(private Database $db) {}
    public function export(int $participantId): array
    {
        $participant = $this->db->fetch('SELECT * FROM participants WHERE id = ?', [$participantId]); if (!$participant) throw new \RuntimeException('Participant not found.', 404);
        return ['participant' => $participant, 'sessions' => $this->db->fetchAll('SELECT * FROM survey_sessions WHERE participant_id = ?', [$participantId]), 'consents' => $this->db->fetchAll('SELECT * FROM consent_logs WHERE participant_id = ?', [$participantId]), 'emails' => $this->db->fetchAll('SELECT * FROM email_logs WHERE recipient_email = ?', [$participant['email']])];
    }
    public function anonymise(int $participantId, int $adminId): void
    {
        $this->db->transaction(function () use ($participantId, $adminId) {
            $before = $this->db->fetch('SELECT name, email FROM participants WHERE id = ? FOR UPDATE', [$participantId]); if (!$before) throw new \RuntimeException('Participant not found.', 404);
            $anonymous = 'deleted+' . bin2hex(random_bytes(10)) . '@invalid.local';
            $this->db->execute('UPDATE participants SET name = ?, email = ?, tags_json = NULL, internal_notes = NULL, marketing_consent = 0, transactional_consent = 0, anonymised_at = NOW(), updated_at = NOW() WHERE id = ?', ['Deleted participant', $anonymous, $participantId]);
            $this->db->execute('INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id, before_json, after_json, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', [$adminId, 'participant.anonymised', 'participant', (string) $participantId, json_encode(['email_hash' => hash('sha256', $before['email'])]), json_encode(['anonymised' => true])]);
        });
    }
}
