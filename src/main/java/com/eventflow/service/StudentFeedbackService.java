package com.eventflow.service;

import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.DaoException;
import com.eventflow.dao.StudentFeedbackDao;
import com.eventflow.dto.FeedbackSubmissionRequestDto;
import com.eventflow.dto.StudentFeedbackEligibleEventDto;
import com.eventflow.dto.StudentFeedbackPageDto;
import com.eventflow.dto.StudentFeedbackSubmissionDto;
import com.eventflow.mapper.StudentDtoMapper;
import com.eventflow.model.Feedback;
import com.eventflow.model.FeedbackMood;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import com.eventflow.validation.FeedbackSubmissionValidator;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.SQLIntegrityConstraintViolationException;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

public final class StudentFeedbackService {

  private final ConnectionManager connectionManager;
  private final StudentFeedbackDao studentFeedbackDao;
  private final StudentDtoMapper studentDtoMapper;
  private final FeedbackSubmissionValidator feedbackSubmissionValidator;
  private final EventIntelligenceService eventIntelligenceService;

  public StudentFeedbackService(
      ConnectionManager connectionManager,
      StudentFeedbackDao studentFeedbackDao,
      StudentDtoMapper studentDtoMapper,
      FeedbackSubmissionValidator feedbackSubmissionValidator,
      EventIntelligenceService eventIntelligenceService) {
    this.connectionManager = connectionManager;
    this.studentFeedbackDao = studentFeedbackDao;
    this.studentDtoMapper = studentDtoMapper;
    this.feedbackSubmissionValidator = feedbackSubmissionValidator;
    this.eventIntelligenceService = eventIntelligenceService;
  }

  public StudentFeedbackPageDto getFeedbackPage(long studentId) {
    return withConnection("load student feedback page", connection -> {
      List<StudentFeedbackEligibleEventDto> eligibleEvents = studentFeedbackDao.findEligibleEvents(connection, studentId)
          .stream()
          .map(event -> studentDtoMapper.toStudentFeedbackEligibleEventDto(
              event.eventId(),
              event.eventName(),
              event.checkedInAt(),
              buildPrompt(event.eventName())))
          .toList();

      List<StudentFeedbackSubmissionDto> submissions = studentFeedbackDao.findSubmissions(connection, studentId)
          .stream()
          .map(submission -> studentDtoMapper.toStudentFeedbackSubmissionDto(
              submission.eventId(),
              submission.eventName(),
              submission.mood(),
              submission.comment(),
              submission.submittedAt()))
          .toList();

      return studentDtoMapper.toStudentFeedbackPageDto(
          Arrays.stream(FeedbackMood.values()).map(Enum::name).toList(),
          eligibleEvents,
          submissions);
    });
  }

  public void submitFeedback(long studentId, long pathEventId, FeedbackSubmissionRequestDto request) {
    FeedbackSubmissionRequestDto validated = feedbackSubmissionValidator.validate(request, pathEventId);
    withConnection("submit student feedback", connection -> {
      if (!studentFeedbackDao.eventExists(connection, pathEventId)) {
        throw new ApplicationException(
            "Event was not found.",
            404,
            ErrorCode.RESOURCE_NOT_FOUND,
            false,
            null);
      }

      if (studentFeedbackDao.feedbackExists(connection, studentId, pathEventId)) {
        throw new ApplicationException(
            "Feedback has already been submitted for this event.",
            409,
            ErrorCode.RESOURCE_CONFLICT,
            false,
            null);
      }

      if (!studentFeedbackDao.isEligibleEvent(connection, studentId, pathEventId)) {
        throw new ApplicationException(
            "Only checked-in events that are still open for feedback can receive a submission.",
            409,
            ErrorCode.RESOURCE_CONFLICT,
            false,
            null);
      }

      try {
        studentFeedbackDao.insertFeedback(
            connection,
            new Feedback(
                null,
                validated.eventId(),
                studentId,
                validated.mood(),
                validated.comment(),
                Instant.now()));
      } catch (SQLIntegrityConstraintViolationException exception) {
        throw new ApplicationException(
            "Feedback has already been submitted for this event.",
            409,
            ErrorCode.RESOURCE_CONFLICT,
            false,
            exception);
      }

          eventIntelligenceService.refreshEventHealth(connection, validated.eventId());

      return null;
    });
  }

  private String buildPrompt(String eventName) {
    return "Share a quick sentiment and note while " + eventName + " is still fresh.";
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