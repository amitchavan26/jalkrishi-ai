package com.jalkrishi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    // Connection pool settings
    private static final int MAX_CONNECTIONS = 50;
    private static final int PENDING_ACQUIRE_MAX_COUNT = 1000;
    private static final Duration PENDING_ACQUIRE_TIMEOUT = Duration.ofSeconds(5);
    private static final Duration CONNECTION_LIFETIME = Duration.ofMinutes(5);

    @Bean
    public ConnectionProvider connectionProvider() {
        return ConnectionProvider.builder("custom")
                .maxConnections(MAX_CONNECTIONS)
                .pendingAcquireMaxCount(PENDING_ACQUIRE_MAX_COUNT)
                .pendingAcquireTimeout(PENDING_ACQUIRE_TIMEOUT)
                .maxIdleTime(CONNECTION_LIFETIME)
                .maxLifeTime(CONNECTION_LIFETIME)
                .build();
    }

    @Bean
    public HttpClient httpClient(ConnectionProvider connectionProvider) {
        return HttpClient.create(connectionProvider)
                .option(io.netty.channel.ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
                .responseTimeout(Duration.ofSeconds(10))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new io.netty.handler.logging.LoggingHandler("reactor.netty.http.client", io.netty.handler.logging.LogLevel.DEBUG))
                );
    }

    /**
     * WebClient for Open-Meteo Weather API
     * Base URL: https://api.open-meteo.com
     * No authentication required
     */
    @Bean("weatherWebClient")
    public WebClient weatherWebClient(
            HttpClient httpClient,
            @Value("${jalkrishi.weather.base-url:https://api.open-meteo.com}") String baseUrl,
            @Value("${jalkrishi.weather.connect-timeout:5000}") int connectTimeout,
            @Value("${jalkrishi.weather.read-timeout:10000}") int readTimeout
    ) {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .filter(logRequestResponse())
                .filter(errorHandlingFilter())
                .build();
    }

    /**
     * WebClient for ML Prediction Service
     * Base URL: http://localhost:8000 (configurable)
     * No authentication required (internal service)
     */
    @Bean("mlWebClient")
    public WebClient mlWebClient(
            HttpClient httpClient,
            @Value("${jalkrishi.ml.url:http://localhost:8000}") String baseUrl,
            @Value("${jalkrishi.ml.connect-timeout:3000}") int connectTimeout,
            @Value("${jalkrishi.ml.read-timeout:5000}") int readTimeout
    ) {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .filter(logRequestResponse())
                .filter(errorHandlingFilter())
                .build();
    }

    /**
     * Logging filter for request/response debugging
     */
    private org.springframework.web.reactive.function.client.ExchangeFilterFunction logRequestResponse() {
        return (request, next) -> {
            org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger("com.jalkrishi.webclient");
            
            // Log request
            log.debug("WebClient Request: {} {}", request.method(), request.url());
            
            return next.exchange(request)
                    .doOnNext(response -> {
                        // Log response
                        log.debug("WebClient Response: {} {}", response.statusCode(), request.url());
                    })
                    .doOnError(error -> 
                        log.error("WebClient Error: {} - {}", request.url(), error.getMessage()));
        };
    }

    /**
     * Error handling filter - converts HTTP error statuses to exceptions
     */
    private org.springframework.web.reactive.function.client.ExchangeFilterFunction errorHandlingFilter() {
        return (request, next) -> next.exchange(request)
                .flatMap(response -> {
                    if (response.statusCode().is4xxClientError() || response.statusCode().is5xxServerError()) {
                        return response.bodyToMono(String.class)
                                .flatMap(body -> reactor.core.publisher.Mono.error(
                                        new org.springframework.web.reactive.function.client.WebClientResponseException(
                                                "HTTP " + response.statusCode() + " - " + body,
                                                response.statusCode().value(),
                                                response.statusCode().toString(),
                                                response.headers().asHttpHeaders(),
                                                body.getBytes(),
                                                java.nio.charset.StandardCharsets.UTF_8
                                        )
                                ));
                    }
                    return reactor.core.publisher.Mono.just(response);
                });
    }
}