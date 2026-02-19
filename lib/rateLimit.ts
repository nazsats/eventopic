// lib/rateLimit.ts
import { NextRequest } from 'next/server';

interface RateLimitStore {
    count: number;
    resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitStore>();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    /**
     * Maximum number of requests allowed in the time window
     */
    maxRequests: number;

    /**
     * Time window in milliseconds
     */
    windowMs: number;

    /**
     * Custom identifier (defaults to IP address)
     */
    identifier?: string;
}

/**
 * Rate limiting middleware
 * @param request - Next.js request object
 * @param config - Rate limit configuration
 * @returns Object with success status and remaining requests
 */
export async function rateLimit(
    request: NextRequest,
    config: RateLimitConfig
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const { maxRequests, windowMs, identifier } = config;

    // Get identifier (IP address or custom)
    const ip = identifier ||
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown';

    const key = `ratelimit:${ip}`;
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
        // Create new entry or reset expired one
        entry = {
            count: 0,
            resetTime: now + windowMs,
        };
        rateLimitStore.set(key, entry);
    }

    // Increment counter
    entry.count++;

    const remaining = Math.max(0, maxRequests - entry.count);
    const success = entry.count <= maxRequests;

    return {
        success,
        limit: maxRequests,
        remaining,
        reset: entry.resetTime,
    };
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
    // Public API endpoints - 10 requests per minute
    PUBLIC_API: {
        maxRequests: 10,
        windowMs: 60 * 1000, // 1 minute
    },

    // Authenticated API endpoints - 30 requests per minute
    AUTHENTICATED_API: {
        maxRequests: 30,
        windowMs: 60 * 1000,
    },

    // File uploads - 5 requests per 5 minutes
    FILE_UPLOAD: {
        maxRequests: 5,
        windowMs: 5 * 60 * 1000,
    },

    // Authentication attempts - 5 requests per 15 minutes
    AUTH_ATTEMPTS: {
        maxRequests: 5,
        windowMs: 15 * 60 * 1000,
    },
} as const;

/**
 * Helper to create rate limit response headers
 */
export function getRateLimitHeaders(result: {
    limit: number;
    remaining: number;
    reset: number;
}): Record<string, string> {
    return {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    };
}
