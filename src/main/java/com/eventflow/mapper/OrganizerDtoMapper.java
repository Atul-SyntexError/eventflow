package com.eventflow.mapper;

import com.eventflow.dto.ActivityFeedItemDto;
import com.eventflow.dto.DelayAlertDto;
import com.eventflow.dto.OrganizerDashboardDto;
import com.eventflow.dto.ScheduleAdjustmentSuggestionDto;
import com.eventflow.dto.TaskAssignmentSuggestionDto;
import com.eventflow.dto.TaskDetailDto;
import com.eventflow.dto.TaskSummaryDto;
import com.eventflow.model.RiskLevel;
import com.eventflow.model.Task;
import java.math.BigDecimal;
import java.util.List;

public final class OrganizerDtoMapper {

  public OrganizerDashboardDto toDashboardDto(
      int openTasks,
      int inProgressTasks,
      int blockedTasks,
      int availableVolunteers,
      List<DelayAlertDto> delayAlerts,
      List<TaskSummaryDto> recentAssignments) {
    return new OrganizerDashboardDto(
        openTasks,
        inProgressTasks,
        blockedTasks,
        availableVolunteers,
        delayAlerts,
        recentAssignments);
  }

  public TaskSummaryDto toTaskSummaryDto(
      Task task,
      String eventName,
      String assignedVolunteerName,
      boolean delayFlag) {
    return new TaskSummaryDto(
        task.taskId(),
        task.eventId(),
        eventName,
        task.title(),
        task.taskPriority(),
        task.taskStatus(),
        task.deadlineAt(),
        assignedVolunteerName,
        delayFlag);
  }

  public TaskDetailDto toTaskDetailDto(
      Task task,
      List<String> requiredSkills,
      List<String> dependencies,
      String assignedVolunteer,
      List<ActivityFeedItemDto> activityFeed) {
    return new TaskDetailDto(
        task.taskId(),
        task.eventId(),
        task.title(),
        task.description(),
        task.taskPriority(),
        task.taskStatus(),
        requiredSkills,
        dependencies,
        assignedVolunteer,
        task.deadlineAt(),
        activityFeed);
  }

  public DelayAlertDto toDelayAlertDto(
      Long taskId,
      Long eventId,
      RiskLevel severity,
      String message,
      String suggestedAction) {
    return new DelayAlertDto(taskId, eventId, severity, message, suggestedAction);
  }

  public TaskAssignmentSuggestionDto toTaskAssignmentSuggestionDto(
      Long volunteerId,
      String volunteerName,
      BigDecimal skillMatchScore,
      BigDecimal availabilityScore,
      BigDecimal performanceScore,
      BigDecimal totalScore,
      List<String> explanation) {
    return new TaskAssignmentSuggestionDto(
        volunteerId,
        volunteerName,
        skillMatchScore,
        availabilityScore,
        performanceScore,
        totalScore,
        explanation);
  }

  public ScheduleAdjustmentSuggestionDto toScheduleAdjustmentSuggestionDto(
      Long eventId,
      String reasonCode,
      String headline,
      String description,
      String currentWindow,
      String suggestedWindow,
      List<Long> impactedTaskIds) {
    return new ScheduleAdjustmentSuggestionDto(
        eventId,
        reasonCode,
        headline,
        description,
        currentWindow,
        suggestedWindow,
        impactedTaskIds);
  }
}