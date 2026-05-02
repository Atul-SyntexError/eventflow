package com.eventflow.service;

import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.DaoException;
import com.eventflow.dao.EventDao;
import com.eventflow.dto.StudentEventCardDto;
import com.eventflow.mapper.StudentDtoMapper;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public final class StudentEventDiscoveryService {

  private final ConnectionManager connectionManager;
  private final EventDao eventDao;
  private final StudentDtoMapper studentDtoMapper;

  public StudentEventDiscoveryService(
      ConnectionManager connectionManager,
      EventDao eventDao,
      StudentDtoMapper studentDtoMapper) {
    this.connectionManager = connectionManager;
    this.eventDao = eventDao;
    this.studentDtoMapper = studentDtoMapper;
  }

  public List<StudentEventCardDto> listDiscoverableEvents(long studentId) {
    return withConnection("load student event discovery", connection ->
        eventDao.findStudentDiscoveryEvents(connection, studentId)
            .stream()
            .map(this::toStudentEventCardDto)
            .toList());
  }

  private StudentEventCardDto toStudentEventCardDto(EventDao.StudentDiscoveryEventRow row) {
    String registrationStatus = resolveRegistrationStatus(row.studentRegistrationStatus());
    String capacityState = resolveCapacityState(row.confirmedCount(), row.event().expectedAttendance());
    String highlightBadge = resolveHighlightBadge(registrationStatus, capacityState);
    return studentDtoMapper.toStudentEventCardDto(row.event(), registrationStatus, capacityState, highlightBadge);
  }

  private String resolveRegistrationStatus(String persistedStatus) {
    if (persistedStatus == null || persistedStatus.isBlank()) {
      return "OPEN";
    }
    return persistedStatus;
  }

  private String resolveCapacityState(int confirmedCount, Integer expectedAttendance) {
    if (expectedAttendance == null || expectedAttendance <= 0) {
      return "FULL";
    }
    return confirmedCount >= expectedAttendance ? "FULL" : "AVAILABLE";
  }

  private String resolveHighlightBadge(String registrationStatus, String capacityState) {
    if ("REGISTERED".equals(registrationStatus)) {
      return "Registered";
    }
    if ("WAITLISTED".equals(registrationStatus)) {
      return "Waitlist";
    }
    if ("FULL".equals(capacityState)) {
      return "Full";
    }
    return "Open";
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