package com.eventflow.dto;

import com.eventflow.model.HealthTrend;
import java.math.BigDecimal;

public record MetricTrendDto(BigDecimal value, BigDecimal delta, HealthTrend trend) {
}