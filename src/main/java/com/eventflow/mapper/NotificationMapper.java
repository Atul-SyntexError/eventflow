package com.eventflow.mapper;

import com.eventflow.dto.NotificationFeedDto;
import com.eventflow.dto.NotificationItemDto;
import com.eventflow.model.Notification;
import java.util.List;

public final class NotificationMapper {

  public NotificationItemDto toItem(Notification notification) {
    return new NotificationItemDto(
        notification.notificationId(),
        notification.notificationType(),
        notification.title(),
        notification.body(),
        notification.linkPath(),
        notification.severity(),
        notification.createdAt(),
        notification.read());
  }

  public NotificationFeedDto toFeed(List<Notification> notifications) {
    List<NotificationItemDto> items = notifications == null
        ? List.of()
        : notifications.stream().map(this::toItem).toList();
    int unreadCount = (int) items.stream().filter(item -> !item.read()).count();
    return new NotificationFeedDto(items, unreadCount);
  }
}