package com.eventflow.dto;

public record ResourceRequirementDto(
    String resourceName,
    Integer quantityRequired,
    Integer quantityAllocated,
    String notes) {
}