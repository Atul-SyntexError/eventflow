package com.eventflow.mapper;

import com.eventflow.dto.EventRecommendationDto;
import com.eventflow.dto.LiveUpdateFeedDto;
import com.eventflow.dto.LiveUpdateItemDto;
import com.eventflow.dto.RegistrationStatusDto;
import com.eventflow.dto.StudentFeedbackEligibleEventDto;
import com.eventflow.dto.StudentFeedbackPageDto;
import com.eventflow.dto.StudentFeedbackSubmissionDto;
import com.eventflow.dto.StudentDashboardDto;
import com.eventflow.dto.StudentEventCardDto;
import com.eventflow.model.FeedbackMood;
import com.eventflow.model.Event;
import com.eventflow.model.Registration;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class StudentDtoMapper {

  public StudentDashboardDto toDashboardDto(
      List<EventRecommendationDto> recommendedEvents,
      List<RegistrationStatusDto> upcomingRegistrations,
      List<LiveUpdateItemDto> liveUpdates) {
    return new StudentDashboardDto(recommendedEvents, upcomingRegistrations, liveUpdates);
  }

  public EventRecommendationDto toEventRecommendationDto(
      Long eventId,
      String name,
      BigDecimal score,
      List<String> reasonTags,
      String headline) {
    return new EventRecommendationDto(eventId, name, score, reasonTags, headline);
  }

  public StudentEventCardDto toStudentEventCardDto(
      Event event,
      String registrationStatus,
      String capacityState,
      String highlightBadge) {
    return new StudentEventCardDto(
        event.eventId(),
        event.name(),
        event.category(),
        event.venue(),
        event.startAt(),
        event.endAt(),
        registrationStatus,
        capacityState,
        highlightBadge);
  }

  public RegistrationStatusDto toRegistrationStatusDto(Registration registration) {
    return new RegistrationStatusDto(
        registration.eventId(),
        registration.studentId(),
        registration.registrationStatus(),
        registration.registeredAt(),
        registration.checkedInAt());
  }

  public LiveUpdateFeedDto toLiveUpdateFeedDto(
      Long eventId,
      List<LiveUpdateItemDto> updates,
      Instant generatedAt) {
    return new LiveUpdateFeedDto(eventId, updates, generatedAt);
  }

  public LiveUpdateItemDto toLiveUpdateItemDto(
      Long eventId,
      String title,
      String type,
      String meta,
      Instant occurredAt) {
    return new LiveUpdateItemDto(eventId, title, type, meta, occurredAt);
  }

  public StudentFeedbackPageDto toStudentFeedbackPageDto(
      List<String> moodOptions,
      List<StudentFeedbackEligibleEventDto> eligibleEvents,
      List<StudentFeedbackSubmissionDto> submissions) {
    return new StudentFeedbackPageDto(moodOptions, eligibleEvents, submissions);
  }

  public StudentFeedbackEligibleEventDto toStudentFeedbackEligibleEventDto(
      Long eventId,
      String eventName,
      Instant checkedInAt,
      String prompt) {
    return new StudentFeedbackEligibleEventDto(eventId, eventName, checkedInAt, prompt);
  }

  public StudentFeedbackSubmissionDto toStudentFeedbackSubmissionDto(
      Long eventId,
      String eventName,
      FeedbackMood mood,
      String comment,
      Instant submittedAt) {
    return new StudentFeedbackSubmissionDto(eventId, eventName, mood, comment, submittedAt);
  }
}