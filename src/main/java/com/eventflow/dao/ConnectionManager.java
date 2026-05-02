package com.eventflow.dao;

import com.eventflow.config.AppConfig;
import com.eventflow.config.ConfigurationException;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;

public final class ConnectionManager implements AutoCloseable {

  public static final String CONTEXT_ATTRIBUTE = "eventflow.connectionManager";

  private final HikariDataSource dataSource;

  public ConnectionManager(AppConfig.DatabaseConfig databaseConfig) {
    validate(databaseConfig);

    HikariConfig hikariConfig = new HikariConfig();
    hikariConfig.setPoolName("EventFlowPool");
    hikariConfig.setDriverClassName(databaseConfig.getDriverClassName());
    hikariConfig.setJdbcUrl(databaseConfig.getUrl());
    hikariConfig.setUsername(databaseConfig.getUsername());
    hikariConfig.setPassword(databaseConfig.getPassword());
    hikariConfig.setMinimumIdle(databaseConfig.getMinIdle());
    hikariConfig.setMaximumPoolSize(databaseConfig.getMaxPoolSize());
    hikariConfig.setConnectionTimeout(databaseConfig.getConnectionTimeoutMs());
    hikariConfig.setAutoCommit(false);
    hikariConfig.setTransactionIsolation("TRANSACTION_READ_COMMITTED");
    dataSource = new HikariDataSource(hikariConfig);
  }

  public DataSource getDataSource() {
    return dataSource;
  }

  public Connection getConnection() throws SQLException {
    return dataSource.getConnection();
  }

  @Override
  public void close() {
    dataSource.close();
  }

  private void validate(AppConfig.DatabaseConfig databaseConfig) {
    if (!databaseConfig.isConfigured()) {
      throw new ConfigurationException("Database URL, username, and password must all be configured before creating the connection pool.");
    }
    if (databaseConfig.getMinIdle() < 0) {
      throw new ConfigurationException("Database pool min-idle must be zero or greater.");
    }
    if (databaseConfig.getMaxPoolSize() < 1) {
      throw new ConfigurationException("Database pool max-size must be at least one.");
    }
    if (databaseConfig.getMaxPoolSize() < databaseConfig.getMinIdle()) {
      throw new ConfigurationException("Database pool max-size must be greater than or equal to min-idle.");
    }
    if (databaseConfig.getConnectionTimeoutMs() < 250L) {
      throw new ConfigurationException("Database pool connection-timeout-ms must be at least 250 milliseconds.");
    }
  }
}