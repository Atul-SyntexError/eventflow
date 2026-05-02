package com.eventflow.dto;

import com.eventflow.model.RiskLevel;
import java.math.BigDecimal;

public record RiskPredictionDto(
    String riskType,
    RiskLevel riskLevel,
    BigDecimal score,
    String headline,
    String description,
    String recommendedAction) {
}