package com.eventflow.dto;

import com.eventflow.model.RiskLevel;

public record DelayAlertDto(
    Long taskId,
    Long eventId,
    RiskLevel severity,
    String message,
    String suggestedAction) {
}