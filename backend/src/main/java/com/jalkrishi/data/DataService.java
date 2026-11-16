package com.jalkrishi.data;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.time.Duration;
import java.util.Arrays;

@Service
public class DataService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public DataService(@Qualifier("weatherWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    public WeatherData getWeather(double lat, double lon) {
        try {
            String json = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/forecast")
                            .queryParam("latitude", lat)
                            .queryParam("longitude", lon)
                            .queryParam("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum")
                            .queryParam("forecast_days", 16)
                            .queryParam("timezone", "auto")
                            .build())
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(Duration.ofSeconds(5));
            return parse(json);
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            // Log the error with status code and body
            org.slf4j.LoggerFactory.getLogger(DataService.class)
                    .error("Weather API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return fallback();
        } catch (org.springframework.web.reactive.function.client.WebClientRequestException e) {
            // Network/connection errors
            org.slf4j.LoggerFactory.getLogger(DataService.class)
                    .error("Weather API connection error: {}", e.getMessage());
            return fallback();
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(DataService.class)
                    .error("Weather API unexpected error: {}", e.getMessage(), e);
            return fallback();
        }
    }

    public static WeatherData parse(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            JsonNode daily = root.get("daily");
            
            double tmax = average(daily.get("temperature_2m_max"));
            double tmin = average(daily.get("temperature_2m_min"));
            double precipitationAvg = average(daily.get("precipitation_sum"));
            double peffDailyMm = 0.8 * precipitationAvg;
            double ra = 15.0;
            
            return new WeatherData(tmax, tmin, ra, peffDailyMm, WeatherSource.LIVE);
        } catch (Exception e) {
            return fallback();
        }
    }

    private static double average(JsonNode array) {
        if (array == null || !array.isArray() || array.size() == 0) {
            return 0.0;
        }
        double sum = 0.0;
        int count = 0;
        for (JsonNode node : array) {
            if (!node.isNull()) {
                sum += node.asDouble();
                count++;
            }
        }
        return count > 0 ? sum / count : 0.0;
    }

    public static WeatherData fallback() {
        return new WeatherData(32.0, 21.0, 15.0, 1.5, WeatherSource.FALLBACK);
    }
}