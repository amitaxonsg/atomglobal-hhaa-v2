#!/usr/bin/env php
<?php
declare(strict_types=1);

$container = require dirname(__DIR__) . '/src/bootstrap.php'; $pdo = $container['db']->pdo();
$pdo->exec('CREATE TABLE IF NOT EXISTS migrations (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, migration VARCHAR(255) NOT NULL UNIQUE, applied_at DATETIME NOT NULL) ENGINE=InnoDB');
$applied = array_column($pdo->query('SELECT migration FROM migrations')->fetchAll(PDO::FETCH_ASSOC), 'migration');
foreach (glob(dirname(__DIR__, 2) . '/database/migrations/*.sql') ?: [] as $file) { $name = basename($file); if (in_array($name, $applied, true)) continue; echo "Applying $name\n"; $pdo->beginTransaction(); try { $pdo->exec(file_get_contents($file)); $statement = $pdo->prepare('INSERT INTO migrations (migration, applied_at) VALUES (?, NOW())'); $statement->execute([$name]); $pdo->commit(); } catch (Throwable $error) { if ($pdo->inTransaction()) $pdo->rollBack(); fwrite(STDERR, $error->getMessage() . "\n"); exit(1); } }
echo "Migrations complete.\n";
