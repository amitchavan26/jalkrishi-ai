package com.jalkrishi.assessment;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Component
public class MlClient {

    private final WebClient webClient;

    public MlClient(@Qualifier("mlWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public Optional<String> predict(double ratio, double tmax, double tmin, double peffDailyMm) {
        try {
            Map<String, Object> requestBody = Map.of(
                    "ratio", ratio,
                    "tmax", tmax,
                    "tmin", tmin,
                    "peffDailyMm", peffDailyMm
            );

            Map<String, Object> response = webClient.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(Duration.ofSeconds(3));

            if (response != null) {
                Object suitability = response.get("suitability");
                if (suitability instanceof String str && !str.isBlank()) {
                    return Optional.of(str);
                }
            }
            return Optional.empty();
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            org.slf4j.LoggerFactory.getLogger(MlClient.class)
                    .error("ML API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return Optional.empty();
        } catch (org.springframework.web.reactive.function.client.WebClientRequestException e) {
            org.slf4j.LoggerFactory.getLogger(MlClient.class)
                    .error("ML API connection error: {}", e.getMessage());
            return Optional.empty();
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(MlClient.class)
                    .error("ML API unexpected error: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }
}
