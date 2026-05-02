package com.eventflow.model;

public record EventResource(
    Long eventResourceId,
    Long eventId,
    String resourceName,
    Integer quantityRequired,
    Integer quantityAllocated,
    String notes) {
}