package com.eventflow.service;

import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.DaoException;
import com.eventflow.dao.EventDao;
import com.eventflow.dao.RegistrationDao;
import com.eventflow.dto.CheckInRequestDto;
import com.eventflow.dto.RegistrationRequestDto;
import com.eventflow.dto.RegistrationStatusDto;
import com.eventflow.dto.StudentCheckInEligibleEventDto;
import com.eventflow.dto.StudentCheckInPageDto;
import com.eventflow.dto.StudentCheckInResultDto;
import com.eventflow.dto.StudentRegistrationItemDto;
import com.eventflow.mapper.StudentDtoMapper;
import com.eventflow.model.Event;
import com.eventflow.model.EventStatus;
import com.eventflow.model.Registration;
import com.eventflow.model.RegistrationStatus;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import com.eventflow.validation.CheckInValidator;
import com.eventflow.validation.RegistrationValidator;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

public final class RegistrationService {

  private static final int RECENT_CHECK_IN_LIMIT = 5;

  private static final DateTimeFormatter DATE_TIME_FORMATTER =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm").withZone(ZoneId.systemDefault());

  private final ConnectionManager connectionManager;
  private final RegistrationDao registrationDao;
  private final EventDao eventDao;
  private final StudentDtoMapper studentDtoMapper;
  private final RegistrationValidator registrationValidator;
  private final CheckInValidator checkInValidator;
  private final EventIntelligenceService eventIntelligenceService;

  public RegistrationService(
      ConnectionManager connectionManager,
      RegistrationDao registrationDao,
      EventDao eventDao,
      StudentDtoMapper studentDtoMapper,
      RegistrationValidator registrationValidator,
      CheckInValidator checkInValidator,
      EventIntelligenceService eventIntelligenceService) {
    this.connectionManager = connectionManager;
    this.registrationDao = registrationDao;
    this.eventDao = eventDao;
    this.studentDtoMapper = studentDtoMapper;
    this.registrationValidator = registrationValidator;
    this.checkInValidator = checkInValidator;
    this.eventIntelligenceService = eventIntelligenceService;
  }

  public List<RegistrationStatusDto> listUserRegistrations(long studentId) {
    return withConnection("list student registrations", connection ->
        registrationDao.findByStudentId(connection, studentId)
            .stream()
            .map(studentDtoMapper::toRegistrationStatusDto)
            .toList());
  }

  public List<StudentRegistrationItemDto> listRegistrationItems(long studentId) {
    return withConnection("list student registration items", connection ->
        registrationDao.findItemsByStudentId(connection, studentId)
            .stream()
            .map(this::toStudentRegistrationItemDto)
            .toList());
  }

  public StudentCheckInPageDto getCheckInPage(long studentId) {
    return withConnection("load student check-in page", connection -> {
      Instant now = Instant.now();
      List<StudentCheckInEligibleEventDto> eligibleEvents = registrationDao.findEligibleCheckInEvents(connection, studentId, now)
          .stream()
          .map(this::toStudentCheckInEligibleEventDto)
          .toList();
      List<StudentCheckInResultDto> recentResults = registrationDao.findRecentCheckedInItems(connection, studentId, RECENT_CHECK_IN_LIMIT)
          .stream()
          .map(this::toStudentCheckInResultDto)
          .toList();
      return new StudentCheckInPageDto(eligibleEvents, recentResults);
    });
  }

  public RegistrationStatusDto createRegistration(long studentId, long pathEventId, RegistrationRequestDto request) {
    RegistrationRequestDto validated = registrationValidator.validate(request, pathEventId);
    return withConnection("create student registration", connection -> {
      Event event = eventDao.findById(connection, validated.eventId())
          .orElseThrow(() -> new ApplicationException(
              "Event was not found.",
              404,
              ErrorCode.RESOURCE_NOT_FOUND,
              false,
              null));

      ensureEventOpenForRegistration(event);

      if (registrationDao.findByEventAndStudent(connection, validated.eventId(), studentId).isPresent()) {
        throw new ApplicationException(
            "Student is already registered for this event.",
            409,
            ErrorCode.DUPLICATE_REGISTRATION,
            false,
            null);
      }

      if (isEventAtCapacity(connection, event)) {
        throw new ApplicationException(
            "Registration is no longer available for this event.",
            409,
            ErrorCode.RESOURCE_CONFLICT,
            false,
            null);
      }

      Instant registeredAt = Instant.now();
      Registration registration = new Registration(
          null,
          validated.eventId(),
          studentId,
          RegistrationStatus.REGISTERED,
          registeredAt,
          null);

      long registrationId;
      try {
        registrationId = registrationDao.insert(connection, registration);
      } catch (SQLIntegrityConstraintViolationException exception) {
        throw new ApplicationException(
            "Student is already registered for this event.",
            409,
            ErrorCode.DUPLICATE_REGISTRATION,
            false,
            exception);
      }

      return studentDtoMapper.toRegistrationStatusDto(
          new Registration(registrationId, validated.eventId(), studentId, RegistrationStatus.REGISTERED, registeredAt, null));
    });
  }

  public RegistrationStatusDto checkInStudent(long studentId, long pathEventId, CheckInRequestDto request) {
    CheckInRequestDto validated = checkInValidator.validate(request, pathEventId);
    return withConnection("check in student registration", connection -> {
      Event event = eventDao.findById(connection, validated.eventId())
          .orElseThrow(() -> new ApplicationException(
              "Event was not found.",
              404,
              ErrorCode.RESOURCE_NOT_FOUND,
              false,
              null));

      ensureCheckInAllowed(event, validated.confirmationCode());

      Registration registration = registrationDao.findByEventAndStudent(connection, validated.eventId(), studentId)
          .orElseThrow(() -> new ApplicationException(
              "Only registered students can check in to this event.",
              409,
              ErrorCode.RESOURCE_CONFLICT,
              false,
              null));

      if (registration.registrationStatus() == RegistrationStatus.CHECKED_IN || registration.checkedInAt() != null) {
        throw new ApplicationException(
            "Student has already checked in for this event.",
            409,
            ErrorCode.RESOURCE_CONFLICT,
            false,
            null);
      }

      if (registration.registrationStatus() != RegistrationStatus.REGISTERED) {
        throw new ApplicationException(
            "Only registered students can check in to this event.",
            409,
            ErrorCode.RESOURCE_CONFLICT,
            false,
            null);
      }

      Instant checkedInAt = Instant.now();
      if (registrationDao.markCheckedIn(connection, registration.registrationId(), checkedInAt) != 1) {
        throw new ApplicationException(
            "Student check-in could not be completed.",
            409,
            ErrorCode.RESOURCE_CONFLICT,
            false,
            null);
      }

      eventIntelligenceService.refreshEventHealth(connection, validated.eventId());

      return studentDtoMapper.toRegistrationStatusDto(
          new Registration(
              registration.registrationId(),
              validated.eventId(),
              studentId,
              RegistrationStatus.CHECKED_IN,
              registration.registeredAt(),
              checkedInAt));
    });
  }

  private void ensureEventOpenForRegistration(Event event) {
    if (event.eventStatus() != EventStatus.REGISTRATION_OPEN) {
      throw new ApplicationException(
          "Registration is closed for this event.",
          409,
          ErrorCode.RESOURCE_CONFLICT,
          false,
          null);
    }

    Instant now = Instant.now();
    if (event.registrationOpenAt() != null && now.isBefore(event.registrationOpenAt())) {
      throw new ApplicationException(
          "Registration is not open for this event yet.",
          409,
          ErrorCode.RESOURCE_CONFLICT,
          false,
          null);
    }

    if (event.registrationCloseAt() != null && now.isAfter(event.registrationCloseAt())) {
      throw new ApplicationException(
          "Registration is closed for this event.",
          409,
          ErrorCode.RESOURCE_CONFLICT,
          false,
          null);
    }
  }

  private boolean isEventAtCapacity(Connection connection, Event event) throws SQLException {
    Integer expectedAttendance = event.expectedAttendance();
    if (expectedAttendance == null || expectedAttendance <= 0) {
      return true;
    }

    return registrationDao.countConfirmedRegistrationsForEvent(connection, event.eventId()) >= expectedAttendance;
  }

  private void ensureCheckInAllowed(Event event, String confirmationCode) {
    if (event.eventStatus() == EventStatus.CANCELLED) {
      throw new ApplicationException(
          "Check-in is unavailable for this event.",
          409,
          ErrorCode.CHECKIN_WINDOW_CLOSED,
          false,
          null);
    }

    Instant now = Instant.now();
    if (event.startAt() == null || event.endAt() == null || now.isBefore(event.startAt()) || now.isAfter(event.endAt())) {
      throw new ApplicationException(
          "Check-in is only available during the active event window.",
          409,
          ErrorCode.CHECKIN_WINDOW_CLOSED,
          false,
          null);
    }

    String eventCode = event.code() == null ? "" : event.code().trim();
    if (!eventCode.equalsIgnoreCase(confirmationCode)) {
      throw new ApplicationException(
          "Confirmation code is invalid for this event.",
          409,
          ErrorCode.RESOURCE_CONFLICT,
          false,
          null);
    }
  }

  private StudentRegistrationItemDto toStudentRegistrationItemDto(RegistrationDao.StudentRegistrationItemRow row) {
    Registration registration = row.registration();
    return new StudentRegistrationItemDto(
        registration.eventId(),
        registration.studentId(),
        row.eventName(),
        row.venue(),
        formatDateTime(row.startAt()),
        formatDateTime(row.endAt()),
        registration.registrationStatus(),
        registration.registeredAt(),
        registration.checkedInAt());
  }

        private StudentCheckInEligibleEventDto toStudentCheckInEligibleEventDto(RegistrationDao.StudentCheckInEligibleEventRow row) {
          Registration registration = row.registration();
          return new StudentCheckInEligibleEventDto(
          registration.eventId(),
          row.eventName(),
          row.venue(),
          formatDateTime(row.startAt()),
          formatDateTime(row.endAt()),
          registration.registrationStatus(),
          row.eventCode());
        }

        private StudentCheckInResultDto toStudentCheckInResultDto(RegistrationDao.StudentCheckInResultRow row) {
          return new StudentCheckInResultDto(
          row.eventId(),
          row.eventName(),
          row.status(),
          formatDateTime(row.checkedInAt()),
          "Attendance confirmed.");
        }

  private String formatDateTime(Instant value) {
    return value == null ? "TBD" : DATE_TIME_FORMATTER.format(value);
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