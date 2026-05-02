package com.eventflow.dto;

import java.util.List;

public record StudentFeedbackPageDto(
    List<String> moodOptions,
    List<StudentFeedbackEligibleEventDto> eligibleEvents,
    List<StudentFeedbackSubmissionDto> submissions) {

  public StudentFeedbackPageDto {
    moodOptions = moodOptions == null ? List.of() : List.copyOf(moodOptions);
    eligibleEvents = eligibleEvents == null ? List.of() : List.copyOf(eligibleEvents);
    submissions = submissions == null ? List.of() : List.copyOf(submissions);
  }
}