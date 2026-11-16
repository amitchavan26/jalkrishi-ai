package com.jalkrishi.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.*;

class RateLimitCleanupTest {

    private void post(RateLimitFilter filter, String ip) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        request.setRequestURI("/api/auth/login");
        request.setRemoteAddr(ip);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        filter.doFilter(request, response, chain);
    }

    private MockHttpServletResponse postAndGetResponse(RateLimitFilter filter, String ip) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("POST");
        request.setRequestURI("/api/auth/login");
        request.setRemoteAddr(ip);
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        filter.doFilter(request, response, chain);
        return response;
    }

    @Test
    void purgeRemovesExpiredEntries() throws Exception {
        AtomicLong clock = new AtomicLong(1_000_000L);
        RateLimitFilter filter = new RateLimitFilter() {
            @Override
            long now() {
                return clock.get();
            }
        };
        ReflectionTestUtils.setField(filter, "limit", 1000);

        for (int i = 1; i <= 5; i++) {
            post(filter, "10.0.0." + i);
        }
        assertEquals(5, filter.trackedClients());

        filter.purgeExpired(clock.get() + 61000);
        assertEquals(0, filter.trackedClients());
    }

    @Test
    void purgeKeepsActiveEntries() throws Exception {
        AtomicLong clock = new AtomicLong(1_000_000L);
        RateLimitFilter filter = new RateLimitFilter() {
            @Override
            long now() {
                return clock.get();
            }
        };
        ReflectionTestUtils.setField(filter, "limit", 1000);

        for (int i = 1; i <= 5; i++) {
            post(filter, "10.0.0." + i);
        }
        assertEquals(5, filter.trackedClients());

        filter.purgeExpired(clock.get());
        assertEquals(5, filter.trackedClients());
    }

    @Test
    void filterPurgesOldClientsByItself() throws Exception {
        AtomicLong clock = new AtomicLong(1_000_000L);
        RateLimitFilter filter = new RateLimitFilter() {
            @Override
            long now() {
                return clock.get();
            }
        };
        ReflectionTestUtils.setField(filter, "limit", 1000);

        for (int i = 1; i <= 5; i++) {
            post(filter, "10.0.0." + i);
        }
        assertEquals(5, filter.trackedClients());

        clock.set(1_061_000);
        post(filter, "10.0.0.9");
        assertEquals(1, filter.trackedClients());
    }

    @Test
    void stillBlocksAfterTheLimit() throws Exception {
        AtomicLong clock = new AtomicLong(1_000_000L);
        RateLimitFilter filter = new RateLimitFilter() {
            @Override
            long now() {
                return clock.get();
            }
        };
        ReflectionTestUtils.setField(filter, "limit", 2);

        MockHttpServletResponse r1 = postAndGetResponse(filter, "10.0.0.1");
        MockHttpServletResponse r2 = postAndGetResponse(filter, "10.0.0.1");
        MockHttpServletResponse r3 = postAndGetResponse(filter, "10.0.0.1");

        assertEquals(200, r1.getStatus());
        assertEquals(200, r2.getStatus());
        assertEquals(429, r3.getStatus());
    }
}