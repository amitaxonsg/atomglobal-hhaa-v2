<?php
declare(strict_types=1);

namespace AtomGlobal\Http;

final class Router
{
    private array $routes = [];
    public function add(string $method, string $pattern, callable $handler): void { $this->routes[] = [$method, $pattern, $handler]; }
    public function dispatch(Request $request): mixed
    {
        foreach ($this->routes as [$method, $pattern, $handler]) {
            if ($method !== $request->method) continue;
            $regex = '#^' . preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $pattern) . '$#';
            if (preg_match($regex, $request->path, $matches)) return $handler($request, array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY));
        }
        return Response::error('Route not found', 404);
    }
}
