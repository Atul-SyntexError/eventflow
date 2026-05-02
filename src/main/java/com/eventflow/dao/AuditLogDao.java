package com.eventflow.dao;

import com.eventflow.model.AuditLog;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public final class AuditLogDao {

  private static final String INSERT_SQL = """
      INSERT INTO audit_logs (
        actor_user_id,
        entity_type,
        entity_id,
        action_type,
        payload_before_json,
        payload_after_json
      )
      VALUES (?, ?, ?, ?, ?, ?)
      """;

  public void insert(Connection connection, AuditLog auditLog) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(INSERT_SQL)) {
      statement.setLong(1, auditLog.actorUserId());
      statement.setString(2, auditLog.entityType());
      statement.setLong(3, auditLog.entityId());
      statement.setString(4, auditLog.actionType());
      statement.setString(5, auditLog.payloadBeforeJson());
      statement.setString(6, auditLog.payloadAfterJson());
      statement.executeUpdate();
    }
  }
}