package com.eventflow.dto;

public record StudentEventDetailPageDto(
    EventDetailDto detail,
    RegistrationStatusDto registration) {
}