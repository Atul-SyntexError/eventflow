package com.eventflow.dto;

public record SessionStatusDto(boolean authenticated, boolean expired, RoleSessionDto session) {
}