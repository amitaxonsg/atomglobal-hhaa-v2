<?php
declare(strict_types=1);

namespace AtomGlobal\Http;

final class Request
{
    public function __construct(public readonly string $method, public readonly string $path, public readonly array $query, public readonly array $headers, public readonly array $body) {}
    public static function capture(): self
    {
        $headers = function_exists('getallheaders') ? getallheaders() : [];
        $input = file_get_contents('php://input') ?: '';
        $body = json_decode($input, true);
        return new self($_SERVER['REQUEST_METHOD'] ?? 'GET', parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/', $_GET, array_change_key_case($headers, CASE_LOWER), is_array($body) ? $body : $_POST);
    }
    public function header(string $name): ?string { return $this->headers[strtolower($name)] ?? null; }
}
