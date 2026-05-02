package com.eventflow.model;

import java.math.BigDecimal;
import java.time.Instant;

public record RiskPrediction(
    Long riskPredictionId,
    Long eventId,
    String riskType,
    RiskLevel riskLevel,
    BigDecimal score,
    String headline,
    String description,
    String recommendedAction,
    Instant generatedAt) {
}