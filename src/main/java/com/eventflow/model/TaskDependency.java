package com.eventflow.model;

public record TaskDependency(Long taskDependencyId, Long taskId, Long dependsOnTaskId) {
}