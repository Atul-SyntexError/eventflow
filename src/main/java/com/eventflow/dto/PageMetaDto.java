package com.eventflow.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public record PageMetaDto(
    Integer page,
    Integer pageSize,
    Long totalItems,
    Integer totalPages,
    String sortBy,
    String sortDirection,
    Integer pollIntervalMs) {

  public static PageMetaDto empty() {
    return new PageMetaDto(null, null, null, null, null, null, null);
  }

  public Map<String, Object> toMap() {
    Map<String, Object> meta = new LinkedHashMap<>();
    putIfPresent(meta, "page", page);
    putIfPresent(meta, "pageSize", pageSize);
    putIfPresent(meta, "totalItems", totalItems);
    putIfPresent(meta, "totalPages", totalPages);
    putIfPresent(meta, "sortBy", sortBy);
    putIfPresent(meta, "sortDirection", sortDirection);
    putIfPresent(meta, "pollIntervalMs", pollIntervalMs);
    return meta;
  }

  private void putIfPresent(Map<String, Object> meta, String key, Object value) {
    if (value != null) {
      meta.put(key, value);
    }
  }
}