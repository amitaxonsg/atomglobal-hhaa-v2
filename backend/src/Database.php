<?php
declare(strict_types=1);

namespace AtomGlobal;

use PDO;

final class Database
{
    private PDO $pdo;

    public function __construct(array $config)
    {
        $this->pdo = new PDO($config['dsn'], $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }

    public function pdo(): PDO { return $this->pdo; }
    public function fetch(string $sql, array $params = []): ?array { $statement = $this->run($sql, $params); $row = $statement->fetch(); return $row === false ? null : $row; }
    public function fetchAll(string $sql, array $params = []): array { return $this->run($sql, $params)->fetchAll(); }
    public function execute(string $sql, array $params = []): int { return $this->run($sql, $params)->rowCount(); }
    public function insert(string $sql, array $params = []): int { $this->run($sql, $params); return (int) $this->pdo->lastInsertId(); }
    public function transaction(callable $callback): mixed { $this->pdo->beginTransaction(); try { $result = $callback($this); $this->pdo->commit(); return $result; } catch (\Throwable $error) { if ($this->pdo->inTransaction()) $this->pdo->rollBack(); throw $error; } }
    private function run(string $sql, array $params): \PDOStatement { $statement = $this->pdo->prepare($sql); $statement->execute($params); return $statement; }
}
