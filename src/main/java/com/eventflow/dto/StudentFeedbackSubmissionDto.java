package com.eventflow.dto;

import com.eventflow.model.FeedbackMood;
import java.time.Instant;

public record StudentFeedbackSubmissionDto(
    Long eventId,
    String eventName,
    FeedbackMood mood,
    String comment,
    Instant submittedAt) {
}