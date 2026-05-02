package com.eventflow.dto;

import java.util.List;

public record NotificationFeedDto(List<NotificationItemDto> items, Integer unreadCount) {

  public NotificationFeedDto {
    items = items == null ? List.of() : List.copyOf(items);
  }
}