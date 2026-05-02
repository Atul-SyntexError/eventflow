package com.eventflow.dao;

import com.eventflow.model.EventResource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public final class EventResourceDao {

  private static final String INSERT_SQL = """
      INSERT INTO event_resources (
        event_id,
        resource_name,
        quantity_required,
        quantity_allocated,
        notes
      )
      VALUES (?, ?, ?, ?, ?)
      """;

  private static final String DELETE_BY_EVENT_ID_SQL = """
      DELETE FROM event_resources
      WHERE event_id = ?
      """;

  private static final String FIND_BY_EVENT_ID_SQL = """
      SELECT
        event_resource_id,
        event_id,
        resource_name,
        quantity_required,
        quantity_allocated,
        notes
      FROM event_resources
      WHERE event_id = ?
      ORDER BY event_resource_id ASC
      """;

  public List<EventResource> findByEventId(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(FIND_BY_EVENT_ID_SQL)) {
      statement.setLong(1, eventId);

      try (ResultSet resultSet = statement.executeQuery()) {
        List<EventResource> resources = new ArrayList<>();
        while (resultSet.next()) {
          resources.add(new EventResource(
              resultSet.getLong("event_resource_id"),
              resultSet.getLong("event_id"),
              resultSet.getString("resource_name"),
              resultSet.getInt("quantity_required"),
              resultSet.getInt("quantity_allocated"),
              resultSet.getString("notes")));
        }
        return resources;
      }
    }
  }

  public void replaceForEvent(Connection connection, long eventId, List<EventResource> resources) throws SQLException {
    deleteByEventId(connection, eventId);
    if (resources == null || resources.isEmpty()) {
      return;
    }

    try (PreparedStatement statement = connection.prepareStatement(INSERT_SQL)) {
      for (EventResource resource : resources) {
        statement.setLong(1, eventId);
        statement.setString(2, resource.resourceName());
        statement.setInt(3, resource.quantityRequired());
        statement.setInt(4, resource.quantityAllocated());
        statement.setString(5, resource.notes());
        statement.addBatch();
      }
      statement.executeBatch();
    }
  }

  public void deleteByEventId(Connection connection, long eventId) throws SQLException {
    try (PreparedStatement statement = connection.prepareStatement(DELETE_BY_EVENT_ID_SQL)) {
      statement.setLong(1, eventId);
      statement.executeUpdate();
    }
  }
}