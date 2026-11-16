package com.jalkrishi.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    @Value("${jalkrishi.ratelimit.auth-per-minute:10}")
    private int limit;

    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();
    private final AtomicLong lastPurge = new AtomicLong(0);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        boolean isLogin = "/api/auth/login".equals(path) && "POST".equals(method);
        boolean isRegister = "/api/auth/register".equals(path) && "POST".equals(method);
        
        if (!isLogin && !isRegister) {
            filterChain.doFilter(request, response);
            return;
        }

        long t = now();
        long last = lastPurge.get();
        if (t - last >= 60000 && lastPurge.compareAndSet(last, t)) {
            purgeExpired(t);
        }

        String ip = request.getRemoteAddr();
        long windowStart = t - TimeUnit.MINUTES.toMillis(1);

        counters.compute(ip, (k, v) -> {
            if (v == null || v.windowStart < windowStart) {
                return new WindowCounter(t, 1);
            }
            v.count++;
            return v;
        });

        WindowCounter counter = counters.get(ip);
        if (counter != null && counter.count > limit) {
            response.setStatus(429);
            response.setContentType("application/json");
            String json = String.format("{\"timestamp\":\"%s\",\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Too many requests\"}", Instant.now().toString());
            response.getWriter().write(json);
            return;
        }

        filterChain.doFilter(request, response);
    }

    long now() {
        return System.currentTimeMillis();
    }

    void purgeExpired(long nowMillis) {
        long cutoff = nowMillis - 60000;
        counters.entrySet().removeIf(entry -> entry.getValue().windowStart < cutoff);
    }

    int trackedClients() {
        return counters.size();
    }

    private static class WindowCounter {
        long windowStart;
        int count;

        WindowCounter(long windowStart, int count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}