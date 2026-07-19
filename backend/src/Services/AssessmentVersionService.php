<?php
declare(strict_types=1);

namespace AtomGlobal\Services;

use AtomGlobal\Database;

final class AssessmentVersionService
{
    public function __construct(private Database $db) {}
    public function publish(int $versionId, int $adminId): void
    {
        $this->db->transaction(function () use ($versionId, $adminId) {
            $version = $this->db->fetch('SELECT * FROM assessment_versions WHERE id = ? FOR UPDATE', [$versionId]); if (!$version || $version['status'] !== 'draft') throw new \RuntimeException('Only draft versions can be published.');
            $count = $this->db->fetch('SELECT COUNT(*) count FROM questions WHERE assessment_version_id = ? AND is_active = 1', [$versionId]); if ((int) $count['count'] !== 50) throw new \RuntimeException('A published version must contain exactly 50 active questions.');
            $this->db->execute('UPDATE assessment_versions SET status = ?, archived_at = NOW(), updated_at = NOW() WHERE track_id = ? AND status = ?', ['archived', $version['track_id'], 'published']);
            $this->db->execute('UPDATE assessment_versions SET status = ?, published_at = NOW(), updated_at = NOW() WHERE id = ?', ['published', $versionId]);
            $this->db->execute('INSERT INTO audit_logs (admin_user_id, action, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, NOW())', [$adminId, 'assessment.published', 'assessment_version', (string) $versionId]);
        });
    }
    public function assertEditable(int $versionId): void { $version = $this->db->fetch('SELECT status FROM assessment_versions WHERE id = ?', [$versionId]); if (!$version || $version['status'] !== 'draft') throw new \RuntimeException('Published and archived versions are immutable. Clone this version to make changes.'); }
}
