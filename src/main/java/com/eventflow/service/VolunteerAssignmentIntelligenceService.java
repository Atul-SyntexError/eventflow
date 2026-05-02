package com.eventflow.service;

import com.eventflow.dao.AdminUserDao;
import com.eventflow.dao.TaskDao;
import com.eventflow.dto.TaskAssignmentSuggestionDto;
import com.eventflow.mapper.OrganizerDtoMapper;
import com.eventflow.model.AvailabilityStatus;
import com.eventflow.model.Task;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public final class VolunteerAssignmentIntelligenceService {

  private static final BigDecimal ZERO = new BigDecimal("0.00");
  private static final BigDecimal ONE = new BigDecimal("1.00");
  private static final BigDecimal LIMITED_AVAILABILITY = new BigDecimal("0.55");
  private static final BigDecimal DEFAULT_PERFORMANCE = new BigDecimal("0.50");
  private static final BigDecimal SKILL_WEIGHT = new BigDecimal("0.50");
  private static final BigDecimal AVAILABILITY_WEIGHT = new BigDecimal("0.20");
  private static final BigDecimal PERFORMANCE_WEIGHT = new BigDecimal("0.30");
  private static final BigDecimal LOAD_PENALTY = new BigDecimal("0.05");

  private final TaskDao taskDao;
  private final AdminUserDao adminUserDao;
  private final OrganizerDtoMapper organizerDtoMapper;

  public VolunteerAssignmentIntelligenceService(
      TaskDao taskDao,
      AdminUserDao adminUserDao,
      OrganizerDtoMapper organizerDtoMapper) {
    this.taskDao = taskDao;
    this.adminUserDao = adminUserDao;
    this.organizerDtoMapper = organizerDtoMapper;
  }

  public List<TaskAssignmentSuggestionDto> listSuggestions(
      Connection connection,
      Task task,
      List<String> requiredSkills) throws SQLException {
    List<TaskDao.VolunteerCandidateRow> candidates = taskDao.findVolunteerCandidates(connection).stream()
        .filter(candidate -> candidate.availabilityStatus() == AvailabilityStatus.AVAILABLE)
        .toList();
    List<Long> candidateIds = candidates.stream().map(TaskDao.VolunteerCandidateRow::userId).toList();
    var skillsByUserId = adminUserDao.findSkillsByUserIds(connection, candidateIds);

    return candidates.stream()
        .map(candidate -> toSuggestion(
            candidate,
            skillsByUserId.getOrDefault(candidate.userId(), List.of()),
            requiredSkills))
        .sorted((left, right) -> right.totalScore().compareTo(left.totalScore()))
        .limit(5)
        .toList();
  }

  private TaskAssignmentSuggestionDto toSuggestion(
      TaskDao.VolunteerCandidateRow candidate,
      List<String> volunteerSkills,
      List<String> requiredSkills) {
    BigDecimal skillMatchScore = computeSkillMatch(volunteerSkills, requiredSkills);
    BigDecimal availabilityScore = candidate.availabilityStatus() == AvailabilityStatus.AVAILABLE ? ONE : LIMITED_AVAILABILITY;
    BigDecimal performanceScore = normalizePerformance(candidate.performanceScore());
    BigDecimal loadPenalty = LOAD_PENALTY.multiply(BigDecimal.valueOf(candidate.activeTaskCount()));
    BigDecimal totalScore = skillMatchScore.multiply(SKILL_WEIGHT)
        .add(availabilityScore.multiply(AVAILABILITY_WEIGHT))
        .add(performanceScore.multiply(PERFORMANCE_WEIGHT))
        .subtract(loadPenalty)
        .setScale(2, RoundingMode.HALF_UP);
    if (totalScore.compareTo(ZERO) < 0) {
      totalScore = ZERO;
    }
    if (totalScore.compareTo(ONE) > 0) {
      totalScore = ONE;
    }

    List<String> explanation = new ArrayList<>();
    if (requiredSkills == null || requiredSkills.isEmpty()) {
      explanation.add("No required skills are locked on this task, so availability and performance carry the ranking.");
    } else {
      long matches = requiredSkills.stream().filter(volunteerSkills::contains).count();
      explanation.add("Matches " + matches + " of " + requiredSkills.size() + " required skills.");
    }
    explanation.add("Availability is " + candidate.availabilityStatus() + " with " + candidate.activeTaskCount() + " active task load entries.");
    explanation.add("Performance score is "
        + normalizePerformance(candidate.performanceScore()).multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP)
        + "%.");

    return organizerDtoMapper.toTaskAssignmentSuggestionDto(
        candidate.userId(),
        candidate.volunteerName(),
        skillMatchScore,
        availabilityScore,
        performanceScore,
        totalScore,
        explanation);
  }

  private BigDecimal computeSkillMatch(List<String> volunteerSkills, List<String> requiredSkills) {
    if (requiredSkills == null || requiredSkills.isEmpty()) {
      return ONE;
    }

    long matches = requiredSkills.stream().filter(volunteerSkills::contains).count();
    return BigDecimal.valueOf(matches)
        .divide(BigDecimal.valueOf(requiredSkills.size()), 2, RoundingMode.HALF_UP);
  }

  private BigDecimal normalizePerformance(BigDecimal performanceScore) {
    if (performanceScore == null) {
      return DEFAULT_PERFORMANCE;
    }

    BigDecimal normalized = performanceScore.divide(new BigDecimal("100.00"), 4, RoundingMode.HALF_UP);
    if (normalized.compareTo(ONE) > 0) {
      return ONE;
    }
    if (normalized.compareTo(ZERO) < 0) {
      return ZERO;
    }
    return normalized.setScale(2, RoundingMode.HALF_UP);
  }
}