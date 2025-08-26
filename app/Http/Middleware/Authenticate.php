<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
//    public function handle(Request $request, Closure $next): Response
//    {
//        return $next($request);
//    }
    protected function redirectTo($request): ?string
    {
        // Stop redirect for API requests

        return null;
    }
}
