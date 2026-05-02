package com.eventflow.service;

import com.eventflow.config.AppConfig;
import com.eventflow.dao.NotificationDao;
import com.eventflow.dao.NotificationLogDao;
import com.eventflow.model.DeliveryStatus;
import com.eventflow.model.Event;
import com.eventflow.model.Notification;
import com.eventflow.model.NotificationChannel;
import com.eventflow.model.NotificationLog;
import com.eventflow.model.NotificationSeverity;
import com.eventflow.model.NotificationType;
import com.eventflow.model.Task;
import com.eventflow.model.User;
import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Properties;

public final class NotificationDeliveryService {

  private static final DateTimeFormatter TIMESTAMP_FORMATTER =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm 'UTC'").withZone(ZoneOffset.UTC);
  private static final int ERROR_MESSAGE_LIMIT = 255;

  private final AppConfig appConfig;
  private final NotificationDao notificationDao;
  private final NotificationLogDao notificationLogDao;

  public NotificationDeliveryService(
      AppConfig appConfig,
      NotificationDao notificationDao,
      NotificationLogDao notificationLogDao) {
    this.appConfig = appConfig;
    this.notificationDao = notificationDao;
    this.notificationLogDao = notificationLogDao;
  }

  public void deliverTaskAssigned(Connection connection, User recipient, Task task) throws SQLException {
    deliver(
        connection,
        recipient,
        task.eventId(),
        task.taskId(),
        NotificationType.TASK_ASSIGNED,
        "New assignment: " + task.title(),
        "You have been assigned to " + task.title() + ".",
        "/volunteer/tasks",
        "Task assigned: " + task.title(),
        buildTaskAssignedEmailBody(recipient, task));
  }

  public void deliverTaskUpdated(Connection connection, User recipient, Task task) throws SQLException {
    deliver(
        connection,
        recipient,
        task.eventId(),
        task.taskId(),
        NotificationType.TASK_UPDATED,
        "Task updated: " + task.title(),
        "Your assigned task " + task.title() + " was updated by the organizer.",
        "/volunteer/tasks",
        "Task updated: " + task.title(),
        buildTaskUpdatedEmailBody(recipient, task));
  }

  public void deliverEventUpdated(Connection connection, User recipient, Event event) throws SQLException {
    deliver(
        connection,
        recipient,
        event.eventId(),
        null,
        NotificationType.EVENT_UPDATED,
        "Event updated: " + event.name(),
        "An event you are supporting was updated: " + event.name() + ".",
        "/volunteer/notifications",
        "Event updated: " + event.name(),
        buildEventUpdatedEmailBody(recipient, event));
  }

  public void deliverScheduleChanged(Connection connection, User recipient, Event event) throws SQLException {
    deliver(
        connection,
        recipient,
        event.eventId(),
        null,
        NotificationType.SCHEDULE_CHANGED,
        "Schedule changed: " + event.name(),
        "The event schedule changed for " + event.name() + ". Check the latest time and venue details.",
        "/student/notifications",
        "Schedule changed: " + event.name(),
        buildScheduleChangedEmailBody(recipient, event));
  }

  private void deliver(
      Connection connection,
      User recipient,
      Long eventId,
      Long taskId,
      NotificationType notificationType,
      String title,
      String body,
      String linkPath,
      String emailSubject,
      String emailBody) throws SQLException {
    Instant now = Instant.now();
    long notificationId = notificationDao.insert(
        connection,
        new Notification(
            null,
            recipient.userId(),
            eventId,
            taskId,
            notificationType,
            NotificationSeverity.INFO,
            title,
            body,
            linkPath,
            false,
            now,
            null));
    notificationLogDao.insert(
        connection,
        new NotificationLog(
            null,
            notificationId,
            NotificationChannel.IN_APP,
            DeliveryStatus.SENT,
            null,
            null,
            now));
    deliverEmail(connection, notificationId, recipient.email(), emailSubject, emailBody);
  }

  private void deliverEmail(
      Connection connection,
      long notificationId,
      String recipientAddress,
      String subject,
      String body) throws SQLException {
    Instant now = Instant.now();
    if (recipientAddress == null || recipientAddress.isBlank()) {
      insertEmailLog(connection, notificationId, null, DeliveryStatus.SKIPPED, "Recipient email is unavailable.", now);
      return;
    }

    if (!appConfig.getMail().isConfigured()) {
      insertEmailLog(connection, notificationId, recipientAddress, DeliveryStatus.SKIPPED, "Mail delivery is not configured.", now);
      return;
    }

    try {
      sendEmail(recipientAddress, subject, body);
      insertEmailLog(connection, notificationId, recipientAddress, DeliveryStatus.SENT, null, now);
    } catch (MessagingException | RuntimeException exception) {
      insertEmailLog(
          connection,
          notificationId,
          recipientAddress,
          DeliveryStatus.FAILED,
          truncate(exception.getMessage(), ERROR_MESSAGE_LIMIT),
          now);
    }
  }

  private void insertEmailLog(
      Connection connection,
      long notificationId,
      String recipientAddress,
      DeliveryStatus deliveryStatus,
      String errorMessage,
      Instant attemptedAt) throws SQLException {
    notificationLogDao.insert(
        connection,
        new NotificationLog(
            null,
            notificationId,
            NotificationChannel.EMAIL,
            deliveryStatus,
            recipientAddress,
            errorMessage,
            attemptedAt));
  }

  private void sendEmail(String recipientAddress, String subject, String body) throws MessagingException {
    AppConfig.MailConfig mailConfig = appConfig.getMail();
    Properties properties = new Properties();
    properties.setProperty("mail.smtp.host", mailConfig.getHost());
    properties.setProperty("mail.smtp.port", Integer.toString(mailConfig.getPort()));
    properties.setProperty("mail.smtp.auth", "true");
    properties.setProperty("mail.smtp.starttls.enable", Boolean.toString(mailConfig.isTlsEnabled()));
    properties.setProperty("mail.smtp.connectiontimeout", Integer.toString(mailConfig.getConnectionTimeoutMs()));
    properties.setProperty("mail.smtp.timeout", Integer.toString(mailConfig.getReadTimeoutMs()));
    properties.setProperty("mail.smtp.writetimeout", Integer.toString(mailConfig.getWriteTimeoutMs()));

    Session session = Session.getInstance(
        properties,
        new Authenticator() {
          @Override
          protected PasswordAuthentication getPasswordAuthentication() {
            return new PasswordAuthentication(mailConfig.getUsername(), mailConfig.getPassword());
          }
        });

    Message message = new MimeMessage(session);
    message.setFrom(new InternetAddress(mailConfig.getFromAddress()));
    message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientAddress));
    message.setSubject(subject);
    message.setText(body);
    Transport.send(message);
  }

  private String buildTaskAssignedEmailBody(User recipient, Task task) {
    return """
        Hello %s,

        You have been assigned a new EventFlow task.

        Task: %s
        Deadline: %s

        Open your task list: %s

        %s
        """.formatted(
        recipient.firstName(),
        task.title(),
        formatInstant(task.deadlineAt()),
        absoluteUrl("/volunteer/tasks"),
        appConfig.getAppName());
  }

  private String buildTaskUpdatedEmailBody(User recipient, Task task) {
    return """
        Hello %s,

        An organizer updated one of your EventFlow tasks.

        Task: %s
        Deadline: %s

        Review the latest task details: %s

        %s
        """.formatted(
        recipient.firstName(),
        task.title(),
        formatInstant(task.deadlineAt()),
        absoluteUrl("/volunteer/tasks"),
        appConfig.getAppName());
  }

  private String buildEventUpdatedEmailBody(User recipient, Event event) {
    return """
        Hello %s,

        An event you are supporting was updated in EventFlow.

        Event: %s
        Venue: %s
        Window: %s to %s

        Review the latest event updates: %s

        %s
        """.formatted(
        recipient.firstName(),
        event.name(),
        event.venue(),
        formatInstant(event.startAt()),
        formatInstant(event.endAt()),
        absoluteUrl("/volunteer/notifications"),
        appConfig.getAppName());
  }

  private String buildScheduleChangedEmailBody(User recipient, Event event) {
    return """
        Hello %s,

        The schedule changed for one of your registered EventFlow events.

        Event: %s
        Venue: %s
        Updated window: %s to %s

        Review the latest event notice: %s

        %s
        """.formatted(
        recipient.firstName(),
        event.name(),
        event.venue(),
        formatInstant(event.startAt()),
        formatInstant(event.endAt()),
        absoluteUrl("/student/notifications"),
        appConfig.getAppName());
  }

  private String absoluteUrl(String path) {
    String baseUrl = appConfig.getBaseUrl();
    if (path == null || path.isBlank()) {
      return baseUrl;
    }
    if (baseUrl.endsWith("/") && path.startsWith("/")) {
      return baseUrl.substring(0, baseUrl.length() - 1) + path;
    }
    if (!baseUrl.endsWith("/") && !path.startsWith("/")) {
      return baseUrl + "/" + path;
    }
    return baseUrl + path;
  }

  private String formatInstant(Instant instant) {
    return instant == null ? "Not set" : TIMESTAMP_FORMATTER.format(instant);
  }

  private String truncate(String value, int maxLength) {
    if (value == null || value.length() <= maxLength) {
      return value;
    }
    return value.substring(0, maxLength);
  }
}