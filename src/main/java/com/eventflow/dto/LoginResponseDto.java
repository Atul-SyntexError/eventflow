package com.eventflow.dto;

public record LoginResponseDto(RoleSessionDto session, String redirectPath) {
}