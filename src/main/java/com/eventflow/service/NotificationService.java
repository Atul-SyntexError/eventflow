package com.eventflow.service;

import com.eventflow.dao.ConnectionManager;
import com.eventflow.dao.DaoException;
import com.eventflow.dao.NotificationDao;
import com.eventflow.dto.NotificationFeedDto;
import com.eventflow.mapper.NotificationMapper;
import com.eventflow.utils.ApplicationException;
import com.eventflow.utils.ErrorCode;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;

public final class NotificationService {

  private final ConnectionManager connectionManager;
  private final NotificationDao notificationDao;
  private final NotificationMapper notificationMapper;

  public NotificationService(
      ConnectionManager connectionManager,
      NotificationDao notificationDao,
      NotificationMapper notificationMapper) {
    this.connectionManager = connectionManager;
    this.notificationDao = notificationDao;
    this.notificationMapper = notificationMapper;
  }

  public NotificationFeedDto getFeed(long recipientUserId) {
    return withConnection(
        "load notification feed",
        connection -> notificationMapper.toFeed(notificationDao.findByRecipientUserId(connection, recipientUserId)));
  }

  public void markAsRead(long notificationId, long recipientUserId) {
    withConnection("mark notification as read", connection -> {
      var notification = notificationDao.findByIdAndRecipientUserId(connection, notificationId, recipientUserId)
          .orElseThrow(() -> new ApplicationException(
              "Notification was not found.",
              404,
              ErrorCode.RESOURCE_NOT_FOUND,
              false,
              null));

      if (!notification.read()) {
        notificationDao.markAsRead(connection, notificationId, recipientUserId, Instant.now());
      }
      return null;
    });
  }

  private <T> T withConnection(String operation, SqlWork<T> work) {
    try (Connection connection = connectionManager.getConnection()) {
      try {
        T result = work.execute(connection);
        connection.commit();
        return result;
      } catch (SQLException exception) {
        rollbackQuietly(connection);
        throw new DaoException("Failed to " + operation + ".", exception);
      } catch (RuntimeException exception) {
        rollbackQuietly(connection);
        throw exception;
      }
    } catch (SQLException exception) {
      throw new DaoException("Failed to open connection for " + operation + ".", exception);
    }
  }

  private void rollbackQuietly(Connection connection) {
    try {
      connection.rollback();
    } catch (SQLException ignored) {
      // Ignore rollback failures to preserve the original exception.
    }
  }

  @FunctionalInterface
  private interface SqlWork<T> {
    T execute(Connection connection) throws SQLException;
  }
}