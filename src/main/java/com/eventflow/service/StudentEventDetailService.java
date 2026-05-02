package com.eventflow.service;

import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.DaoException;
import com.eventflow.dao.EventDao;
import com.eventflow.dao.EventResourceDao;
import com.eventflow.dto.EventDetailDto;
import com.eventflow.dto.EventHealthSnapshotDto;
import com.eventflow.dto.TimelineItemDto;
import com.eventflow.mapper.AdminDtoMapper;
import com.eventflow.model.Event;
import com.eventflow.model.EventResource;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class StudentEventDetailService {

  private final ConnectionManager connectionManager;
  private final EventDao eventDao;
  private final EventResourceDao eventResourceDao;
  private final EventIntelligenceService eventIntelligenceService;
  private final AdminDtoMapper adminDtoMapper;

  public StudentEventDetailService(
      ConnectionManager connectionManager,
      EventDao eventDao,
      EventResourceDao eventResourceDao,
      EventIntelligenceService eventIntelligenceService,
      AdminDtoMapper adminDtoMapper) {
    this.connectionManager = connectionManager;
    this.eventDao = eventDao;
    this.eventResourceDao = eventResourceDao;
    this.eventIntelligenceService = eventIntelligenceService;
    this.adminDtoMapper = adminDtoMapper;
  }

  public EventDetailDto getEventDetail(long eventId) {
    return withConnection("load student event detail", connection -> {
      Event event = eventDao.findById(connection, eventId)
          .orElseThrow(() -> new ApplicationException(
              "Event was not found.",
              404,
              ErrorCode.RESOURCE_NOT_FOUND,
              false,
              null));

      List<EventResource> resources = eventResourceDao.findByEventId(connection, eventId);
      EventHealthSnapshotDto healthSnapshot = eventIntelligenceService.loadEventHealthSnapshot(connection, eventId);

      return adminDtoMapper.toEventDetailDto(
          event,
          resources,
          healthSnapshot,
          List.of(),
          buildTimeline(event));
    });
  }

  private List<TimelineItemDto> buildTimeline(Event event) {
    List<TimelineItemDto> timeline = new ArrayList<>();

    if (event.registrationOpenAt() != null || event.registrationCloseAt() != null) {
      timeline.add(new TimelineItemDto(
          null,
          "Registration window",
          event.registrationOpenAt(),
          event.registrationCloseAt(),
          resolveWindowStatus(event.registrationOpenAt(), event.registrationCloseAt()),
          List.of()));
    }

    timeline.add(new TimelineItemDto(
        null,
        "Event window",
        event.startAt(),
        event.endAt(),
        resolveWindowStatus(event.startAt(), event.endAt()),
        List.of()));

    return timeline;
  }

  private String resolveWindowStatus(Instant startAt, Instant endAt) {
    Instant now = Instant.now();
    if (startAt != null && now.isBefore(startAt)) {
      return "UPCOMING";
    }
    if (endAt != null && now.isAfter(endAt)) {
      return "COMPLETED";
    }
    return "READY";
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