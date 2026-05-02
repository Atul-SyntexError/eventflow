package com.eventflow.dto;

import java.util.List;

final class DtoCollections {

  private DtoCollections() {
  }

  static <T> List<T> copyOf(List<T> items) {
    return items == null ? List.of() : List.copyOf(items);
  }
}