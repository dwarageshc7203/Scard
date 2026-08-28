package me.dwaragesh.backend.interceptor;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;

/**
 *
 * <p>Per-IP buckets are stored in a Caffeine cache with TTL expiry to prevent the
 * unbounded memory leak that would occur with a plain ConcurrentHashMap (old impl).
 *
 * <p>Limits:
 *   - /api/profile/platforms      → 5 req / minute  (external API sync — expensive)
 *   - /api/profile/check-*        → 20 req / minute (sign-up UX checks)
 *   - /api/profile/{user}/export  → 3 req / minute  (CPU-bound PDF rendering)
 */
@Slf4j
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    // Buckets expire 2 hours after last access so memory is bounded.
    private final Cache<String, Bucket> cache = Caffeine.newBuilder()
            .expireAfterAccess(Duration.ofHours(2))
            .maximumSize(50_000)
            .build();

    private Bucket resolveBucket(String key, Bandwidth bandwidth) {
        return cache.get(key, k -> Bucket.builder().addLimit(bandwidth).build());
    }

    // 5 requests / minute for platform sync (calls external APIs)
    private static final Bandwidth SYNC_LIMIT =
            Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1)));

    // 20 requests / minute for check-* endpoints (sign-up form UX)
    private static final Bandwidth CHECK_LIMIT =
            Bandwidth.classic(20, Refill.greedy(20, Duration.ofMinutes(1)));

    // 3 requests / minute for the PDF export (CPU-intensive, unauthenticated)
    private static final Bandwidth EXPORT_LIMIT =
            Bandwidth.classic(3, Refill.greedy(3, Duration.ofMinutes(1)));

    // 15 requests / minute for OG images (CPU intensive)
    private static final Bandwidth OG_LIMIT =
            Bandwidth.classic(15, Refill.greedy(15, Duration.ofMinutes(1)));

    // 5 requests / minute for profile picture uploads (Disk / CPU intensive)
    private static final Bandwidth PFP_LIMIT =
            Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1)));

    // 60 requests / minute for default public endpoints
    private static final Bandwidth DEFAULT_LIMIT =
            Bandwidth.classic(60, Refill.greedy(60, Duration.ofMinutes(1)));

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        // forward-headers-strategy=framework already resolves the real client IP;
        // never trust a user-supplied X-Forwarded-For header for rate limiting.
        String ip = request.getRemoteAddr();
        String uri = request.getRequestURI();

        Bucket bucket = null;

        if (uri.startsWith("/api/profile/platforms")) {
            bucket = resolveBucket("sync:" + ip, SYNC_LIMIT);
        } else if (uri.startsWith("/api/profile/check-")) {
            bucket = resolveBucket("check:" + ip, CHECK_LIMIT);
        } else if (uri.matches("/api/profile/[^/]+/export")) {
            bucket = resolveBucket("export:" + ip, EXPORT_LIMIT);
        } else if (uri.equals("/api/profile/pfp")) {
            bucket = resolveBucket("pfp:" + ip, PFP_LIMIT);
        } else if (uri.equals("/api/profiles") || uri.matches("/api/profile/[^/]+/contributions") || uri.matches("/api/profile/[^/]+")) {
            bucket = resolveBucket("public:" + ip, DEFAULT_LIMIT);
        } else if (uri.equals("/api/profile")) {
            bucket = resolveBucket("profile:" + ip, DEFAULT_LIMIT);
        } else if (uri.equals("/api/me")) {
            bucket = resolveBucket("me:" + ip, DEFAULT_LIMIT);
        } else if (uri.startsWith("/api/og/")) {
            bucket = resolveBucket("og:" + ip, OG_LIMIT);
        }

        if (bucket != null && !bucket.tryConsume(1)) {
            log.warn("Rate limit exceeded for IP {} on {}", ip, uri);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too many requests. Please wait before trying again.\"}");
            return false;
        }

        return true;
    }
}
