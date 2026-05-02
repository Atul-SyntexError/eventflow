package com.eventflow.model;

import java.time.Instant;

public record Feedback(
    Long feedbackId,
    Long eventId,
    Long studentId,
    FeedbackMood mood,
    String comment,
    Instant submittedAt) {
}