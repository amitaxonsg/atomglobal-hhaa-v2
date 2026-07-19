#!/usr/bin/env php
<?php
declare(strict_types=1);

$container = require dirname(__DIR__) . '/src/bootstrap.php';
$pdo = $container['db']->pdo();
$pdo->exec('CREATE TABLE IF NOT EXISTS migrations (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, migration VARCHAR(255) NOT NULL UNIQUE, applied_at DATETIME NOT NULL) ENGINE=InnoDB');
$applied = array_column($pdo->query('SELECT migration FROM migrations')->fetchAll(PDO::FETCH_ASSOC), 'migration');
$files = glob(dirname(__DIR__, 2) . '/database/migrations/*.sql') ?: [];
sort($files, SORT_NATURAL);

foreach ($files as $file) {
    $name = basename($file);
    if (in_array($name, $applied, true)) continue;
    echo "Applying $name\n";
    $sql = file_get_contents($file);
    if ($sql === false || trim($sql) === '') {
        fwrite(STDERR, "Migration is empty or unreadable: $name\n");
        exit(1);
    }

    try {
        // MySQL implicitly commits DDL statements. Wrapping a multi-table schema file
        // in a PDO transaction causes a false "no active transaction" failure after
        // the implicit commit, so the migration and tracking insert are executed in
        // order without pretending the DDL is transactional.
        $pdo->exec($sql);
        $statement = $pdo->prepare('INSERT INTO migrations (migration, applied_at) VALUES (?, NOW())');
        $statement->execute([$name]);
    } catch (Throwable $error) {
        fwrite(STDERR, "Migration $name failed: {$error->getMessage()}\n");
        exit(1);
    }
}

echo "Migrations complete.\n";
