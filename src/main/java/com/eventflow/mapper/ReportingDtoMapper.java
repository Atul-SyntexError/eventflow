package com.eventflow.mapper;

import com.eventflow.dto.AttendanceSummaryDto;
import com.eventflow.dto.EventHealthSnapshotDto;
import com.eventflow.dto.FeedbackAnalysisDto;
import com.eventflow.dto.ReportInsightDto;
import com.eventflow.dto.ReportSummaryDto;
import com.eventflow.dto.VolunteerLeaderboardItemDto;
import com.eventflow.dto.VolunteerPerformanceReportDto;
import java.math.BigDecimal;
import java.util.List;

public final class ReportingDtoMapper {

  public ReportSummaryDto toReportSummaryDto(
      Long eventId,
      AttendanceSummaryDto attendanceSummary,
      ReportInsightDto feedbackSummary,
      ReportInsightDto volunteerSummary,
      EventHealthSnapshotDto healthSummary) {
    return new ReportSummaryDto(
        eventId,
        attendanceSummary,
        feedbackSummary,
        volunteerSummary,
        healthSummary);
  }

  public ReportInsightDto toReportInsightDto(String title, String summary, String trend) {
    return new ReportInsightDto(title, summary, trend);
  }

  public AttendanceSummaryDto toAttendanceSummaryDto(
      String forecastFillRate,
      Integer projectedWalkIns,
      String noShowBuffer,
      String volunteerCoverage,
      String note) {
    return new AttendanceSummaryDto(
        forecastFillRate,
        projectedWalkIns,
        noShowBuffer,
        volunteerCoverage,
        note);
  }

  public FeedbackAnalysisDto toFeedbackAnalysisDto(
      Long eventId,
      int positiveCount,
      int neutralCount,
      int negativeCount,
      BigDecimal averageMoodScore,
      List<String> topComments) {
    return new FeedbackAnalysisDto(
        eventId,
        positiveCount,
        neutralCount,
        negativeCount,
        averageMoodScore,
        topComments);
  }

  public VolunteerPerformanceReportDto toVolunteerPerformanceReportDto(
      Long eventId,
      List<VolunteerLeaderboardItemDto> topVolunteers,
      BigDecimal coverageRate,
      BigDecimal completionRate) {
    return new VolunteerPerformanceReportDto(eventId, topVolunteers, coverageRate, completionRate);
  }

  public VolunteerLeaderboardItemDto toLeaderboardItem(
      Long volunteerId,
      String volunteerName,
      BigDecimal completionRate,
      BigDecimal onTimeRate,
      BigDecimal performanceScore,
      Integer completedTaskCount) {
    return new VolunteerLeaderboardItemDto(
        volunteerId,
        volunteerName,
        completionRate,
        onTimeRate,
        performanceScore,
        completedTaskCount);
  }
}