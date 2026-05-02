package com.eventflow.dto;

public record TaskAssignmentRequestDto(Long volunteerId, String assignmentMode, String assignmentReason) {
}