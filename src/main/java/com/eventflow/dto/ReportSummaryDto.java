package com.eventflow.dto;

public record ReportSummaryDto(
    Long eventId,
    AttendanceSummaryDto attendanceSummary,
    ReportInsightDto feedbackSummary,
    ReportInsightDto volunteerSummary,
    EventHealthSnapshotDto healthSummary) {
}