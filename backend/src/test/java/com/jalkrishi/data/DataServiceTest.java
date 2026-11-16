package com.jalkrishi.data;

import com.jalkrishi.config.WebClientConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.reactive.function.client.WebClient;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@Import(WebClientConfig.class)
class DataServiceTest {

    @Autowired
    private DataService dataService;

    @MockitoBean
    @Qualifier("weatherWebClient")
    private WebClient weatherWebClient;

    @Test
    void parseComputesAverages() {
        String json = "{\"daily\":{\"temperature_2m_max\":[30,32,34],\"temperature_2m_min\":[20,22,24],\"precipitation_sum\":[0,5,10]}}";
        WeatherData result = DataService.parse(json);
        
        assertEquals(32.0, result.tmax(), 0.001);
        assertEquals(22.0, result.tmin(), 0.001);
        assertEquals(4.0, result.peffDailyMm(), 0.001); // 0.8 * 5 = 4.0
        assertEquals(15.0, result.ra(), 0.001);
        assertEquals(WeatherSource.LIVE, result.source());
    }

    @Test
    void unreachableServerReturnsFallback() {
        // Test the fallback behavior when WebClient throws an exception
        WeatherData result = dataService.getWeather(18.5, 73.8);
        
        WeatherData fallback = DataService.fallback();
        assertEquals(fallback.tmax(), result.tmax(), 0.001);
        assertEquals(fallback.tmin(), result.tmin(), 0.001);
        assertEquals(fallback.ra(), result.ra(), 0.001);
        assertEquals(fallback.peffDailyMm(), result.peffDailyMm(), 0.001);
        assertEquals(WeatherSource.FALLBACK, result.source());
    }
}