<?php
declare(strict_types=1);

namespace AtomGlobal\Services;

final class ScoringService
{
    public function score(array $questions, array $answers, array $profiles): array
    {
        $subscales = []; $rawTotal = 0; $answered = 0;
        foreach ($questions as $question) {
            $answer = $answers[(string) $question['id']] ?? $answers[$question['position'] - 1] ?? null;
            $raw = is_array($answer) ? ($answer['value'] ?? null) : $answer;
            if (!is_numeric($raw)) continue;
            $raw = (int) $raw;
            if ($raw < 1 || $raw > 5) continue;
            $value = $question['direction'] === 'K' ? 6 - $raw : $raw;
            $rawTotal += $value; $answered++;
            $code = $question['subscale_code']; $subscales[$code] ??= ['score' => 0, 'count' => 0]; $subscales[$code]['score'] += $value; $subscales[$code]['count']++;
        }
        if ($answered === 0) throw new \InvalidArgumentException('At least one scored answer is required.');
        $total = (int) round($rawTotal / $answered * 50);
        $subScores = array_map(fn(array $item) => (int) round($item['score'] / $item['count'] * 5), $subscales);
        $profile = null; foreach ($profiles as $candidate) { if ($total >= $candidate['min_score'] && $total <= $candidate['max_score']) { $profile = $candidate; break; } }
        if (!$profile) throw new \RuntimeException('No profile rule matches this score.');
        return ['total' => $total, 'subscales' => $subScores, 'profile' => $profile];
    }
}
