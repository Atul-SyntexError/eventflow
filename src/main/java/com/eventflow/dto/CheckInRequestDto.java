package com.eventflow.dto;

public record CheckInRequestDto(Long eventId, String confirmationCode) {
}