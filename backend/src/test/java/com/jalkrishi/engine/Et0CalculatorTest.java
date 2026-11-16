package com.jalkrishi.engine;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class Et0CalculatorTest {

    @Test
    void normalCaseReturnsExpectedValue() {
        double result = Et0Calculator.et0(34.0, 22.0, 15.0);
        assertEquals(5.47, result, 0.01);
    }

    @Test
    void tmaxEqualsTminReturnsZero() {
        double result = Et0Calculator.et0(30.0, 30.0, 15.0);
        assertEquals(0.0, result);
    }

    @Test
    void tmaxLessThanTminThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> Et0Calculator.et0(20.0, 25.0, 15.0));
    }
}