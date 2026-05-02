package com.eventflow.dto;

import com.eventflow.model.FeedbackMood;

public record FeedbackSubmissionRequestDto(Long eventId, FeedbackMood mood, String comment) {
}