package com.eventflow.service;

import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.DaoException;
import com.eventflow.dao.VolunteerPerformanceDao;
import com.eventflow.dto.RecentEventPerformanceDto;
import com.eventflow.dto.VolunteerPerformanceDto;
import com.eventflow.mapper.VolunteerDtoMapper;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public final class VolunteerPerformanceService {

  private static final BigDecimal ZERO_RATIO = new BigDecimal("0.00");
  private static final BigDecimal FULL_RATIO = new BigDecimal("1.00");

  private final ConnectionManager connectionManager;
  private final VolunteerPerformanceDao volunteerPerformanceDao;
  private final VolunteerDtoMapper volunteerDtoMapper;

  public VolunteerPerformanceService(
      ConnectionManager connectionManager,
      VolunteerPerformanceDao volunteerPerformanceDao,
      VolunteerDtoMapper volunteerDtoMapper) {
    this.connectionManager = connectionManager;
    this.volunteerPerformanceDao = volunteerPerformanceDao;
    this.volunteerDtoMapper = volunteerDtoMapper;
  }

  public VolunteerPerformanceDto getPerformance(long volunteerId) {
    return withConnection("load volunteer performance", connection -> {
      VolunteerPerformanceDao.VolunteerPerformanceAggregateRow aggregate =
          volunteerPerformanceDao.findPerformanceAggregate(connection, volunteerId);
      List<RecentEventPerformanceDto> recentEvents = volunteerPerformanceDao
          .findRecentEventPerformance(connection, volunteerId, 3)
          .stream()
          .map(this::toRecentEventPerformanceDto)
          .toList();

      return volunteerDtoMapper.toPerformanceDto(
          ratio(aggregate.completedTaskCount(), aggregate.totalTaskCount(), ZERO_RATIO),
          ratio(aggregate.onTimeCompletedCount(), aggregate.completedTaskCount(), ZERO_RATIO),
          aggregate.activeTaskCount(),
          aggregate.completedTaskCount(),
          recentEvents);
    });
  }

  private RecentEventPerformanceDto toRecentEventPerformanceDto(
      VolunteerPerformanceDao.VolunteerEventPerformanceRow row) {
    BigDecimal completionRate = ratio(row.completedTaskCount(), row.totalTaskCount(), ZERO_RATIO);
    BigDecimal onTimeRate = ratio(row.onTimeCompletedCount(), row.completedTaskCount(), ZERO_RATIO);
    String roleLabel = row.activeTaskCount() > 0 ? "Live volunteer support" : "Volunteer support";
    String highlight = buildHighlight(row);
    return volunteerDtoMapper.toRecentEventPerformanceDto(
        row.eventId(),
        row.eventName(),
        roleLabel,
        row.completedTaskCount(),
        onTimeRate,
        completionRate,
        highlight);
  }

  private String buildHighlight(VolunteerPerformanceDao.VolunteerEventPerformanceRow row) {
    String latestTaskTitle = row.latestTaskTitle();
    if (row.activeTaskCount() > 0 && latestTaskTitle != null && !latestTaskTitle.isBlank()) {
      return "Current focus: " + latestTaskTitle + ".";
    }
    if (row.completedTaskCount() > 0 && latestTaskTitle != null && !latestTaskTitle.isBlank()) {
      return "Recently completed: " + latestTaskTitle + ".";
    }
    if (row.completedTaskCount() > 0) {
      return row.completedTaskCount() + " completed tasks recorded for this event.";
    }
    if (latestTaskTitle != null && !latestTaskTitle.isBlank()) {
      return "Most recent assignment: " + latestTaskTitle + ".";
    }
    return "Volunteer history is still building for this event.";
  }

  private BigDecimal ratio(int numerator, int denominator, BigDecimal zeroValue) {
    if (denominator <= 0) {
      return zeroValue.setScale(2, RoundingMode.HALF_UP);
    }

    BigDecimal value = BigDecimal.valueOf(numerator)
        .divide(BigDecimal.valueOf(denominator), 4, RoundingMode.HALF_UP);
    if (value.compareTo(FULL_RATIO) > 0) {
      value = FULL_RATIO;
    }
    if (value.compareTo(ZERO_RATIO) < 0) {
      value = ZERO_RATIO;
    }
    return value.setScale(2, RoundingMode.HALF_UP);
  }

  private <T> T withConnection(String operation, SqlWork<T> work) {
    try (Connection connection = connectionManager.getConnection()) {
      try {
        T result = work.execute(connection);
        connection.commit();
        return result;
      } catch (SQLException exception) {
        rollbackQuietly(connection);
        throw new DaoException("Failed to " + operation + ".", exception);
      } catch (RuntimeException exception) {
        rollbackQuietly(connection);
        throw exception;
      }
    } catch (SQLException exception) {
      throw new DaoException("Failed to open connection for " + operation + ".", exception);
    }
  }

  private void rollbackQuietly(Connection connection) {
    try {
      connection.rollback();
    } catch (SQLException ignored) {
      // Ignore rollback failures to preserve the original exception.
    }
  }

  @FunctionalInterface
  private interface SqlWork<T> {
    T execute(Connection connection) throws SQLException;
  }
}