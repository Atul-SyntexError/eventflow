package com.eventflow.dto;

public record AttendanceSummaryDto(
    String forecastFillRate,
    Integer projectedWalkIns,
    String noShowBuffer,
    String volunteerCoverage,
    String note) {
}