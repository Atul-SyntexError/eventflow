package com.eventflow.dto;

import java.util.List;

public record StudentCheckInPageDto(
    List<StudentCheckInEligibleEventDto> eligibleEvents,
    List<StudentCheckInResultDto> recentResults) {
}