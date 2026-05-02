package com.eventflow.config;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Properties;

public final class AppConfigLoader {

  private static final String DEFAULTS_RESOURCE = "eventflow-defaults.properties";
  private static final String EXTERNAL_CONFIG_PROPERTY = "eventflow.config.file";
  private static final String EXTERNAL_CONFIG_ENV = "EVENTFLOW_CONFIG_FILE";

  private static final Map<String, String> ENV_OVERRIDES = Map.ofEntries(
      Map.entry("eventflow.app.name", "EVENTFLOW_APP_NAME"),
      Map.entry("eventflow.app.environment", "EVENTFLOW_APP_ENVIRONMENT"),
      Map.entry("eventflow.app.base-url", "EVENTFLOW_APP_BASE_URL"),
      Map.entry("eventflow.db.driver", "EVENTFLOW_DB_DRIVER"),
      Map.entry("eventflow.db.url", "EVENTFLOW_DB_URL"),
      Map.entry("eventflow.db.username", "EVENTFLOW_DB_USERNAME"),
      Map.entry("eventflow.db.password", "EVENTFLOW_DB_PASSWORD"),
      Map.entry("eventflow.db.pool.min-idle", "EVENTFLOW_DB_POOL_MIN_IDLE"),
      Map.entry("eventflow.db.pool.max-size", "EVENTFLOW_DB_POOL_MAX_SIZE"),
      Map.entry("eventflow.db.pool.connection-timeout-ms", "EVENTFLOW_DB_POOL_CONNECTION_TIMEOUT_MS"),
      Map.entry("eventflow.mail.host", "EVENTFLOW_MAIL_HOST"),
      Map.entry("eventflow.mail.port", "EVENTFLOW_MAIL_PORT"),
      Map.entry("eventflow.mail.username", "EVENTFLOW_MAIL_USERNAME"),
      Map.entry("eventflow.mail.password", "EVENTFLOW_MAIL_PASSWORD"),
      Map.entry("eventflow.mail.from-address", "EVENTFLOW_MAIL_FROM_ADDRESS"),
      Map.entry("eventflow.mail.tls.enabled", "EVENTFLOW_MAIL_TLS_ENABLED"),
      Map.entry("eventflow.mail.connection-timeout-ms", "EVENTFLOW_MAIL_CONNECTION_TIMEOUT_MS"),
      Map.entry("eventflow.mail.read-timeout-ms", "EVENTFLOW_MAIL_READ_TIMEOUT_MS"),
      Map.entry("eventflow.mail.write-timeout-ms", "EVENTFLOW_MAIL_WRITE_TIMEOUT_MS"));

  public AppConfig load() {
    Properties properties = new Properties();
    loadDefaults(properties);
    loadExternalOverrides(properties);
    applyOverrides(properties);
    return toConfig(properties);
  }

  private void loadDefaults(Properties properties) {
    try (InputStream inputStream = Thread.currentThread()
        .getContextClassLoader()
        .getResourceAsStream(DEFAULTS_RESOURCE)) {
      if (inputStream == null) {
        throw new ConfigurationException("Missing classpath defaults resource: " + DEFAULTS_RESOURCE);
      }
      properties.load(inputStream);
    } catch (IOException exception) {
      throw new ConfigurationException("Failed to load classpath defaults: " + DEFAULTS_RESOURCE, exception);
    }
  }

  private void loadExternalOverrides(Properties properties) {
    String configuredPath = trimToNull(System.getProperty(EXTERNAL_CONFIG_PROPERTY));
    if (configuredPath == null) {
      configuredPath = trimToNull(System.getenv(EXTERNAL_CONFIG_ENV));
    }
    if (configuredPath == null) {
      return;
    }

    Path path = Path.of(configuredPath);
    if (!Files.isRegularFile(path)) {
      throw new ConfigurationException("Configured external properties file does not exist: " + path);
    }

    try (InputStream inputStream = Files.newInputStream(path)) {
      properties.load(inputStream);
    } catch (IOException exception) {
      throw new ConfigurationException("Failed to load external properties file: " + path, exception);
    }
  }

  private void applyOverrides(Properties properties) {
    for (Map.Entry<String, String> entry : ENV_OVERRIDES.entrySet()) {
      String propertyKey = entry.getKey();
      String overrideValue = trimToNull(System.getProperty(propertyKey));
      if (overrideValue == null) {
        overrideValue = trimToNull(System.getenv(entry.getValue()));
      }
      if (overrideValue != null) {
        properties.setProperty(propertyKey, overrideValue);
      }
    }
  }

  private AppConfig toConfig(Properties properties) {
    String environment = normalizeEnvironment(requiredProperty(properties, "eventflow.app.environment"));
    String appName = requiredProperty(properties, "eventflow.app.name");
    String baseUrl = requiredProperty(properties, "eventflow.app.base-url");

    AppConfig.DatabaseConfig databaseConfig = new AppConfig.DatabaseConfig(
        requiredProperty(properties, "eventflow.db.driver"),
        optionalProperty(properties, "eventflow.db.url"),
        optionalProperty(properties, "eventflow.db.username"),
        optionalProperty(properties, "eventflow.db.password"),
        intProperty(properties, "eventflow.db.pool.min-idle"),
        intProperty(properties, "eventflow.db.pool.max-size"),
        longProperty(properties, "eventflow.db.pool.connection-timeout-ms"));

    AppConfig.MailConfig mailConfig = new AppConfig.MailConfig(
        optionalProperty(properties, "eventflow.mail.host"),
        intProperty(properties, "eventflow.mail.port"),
        optionalProperty(properties, "eventflow.mail.username"),
        optionalProperty(properties, "eventflow.mail.password"),
        optionalProperty(properties, "eventflow.mail.from-address"),
      booleanProperty(properties, "eventflow.mail.tls.enabled"),
      intProperty(properties, "eventflow.mail.connection-timeout-ms"),
      intProperty(properties, "eventflow.mail.read-timeout-ms"),
      intProperty(properties, "eventflow.mail.write-timeout-ms"));

    return new AppConfig(appName, environment, baseUrl, databaseConfig, mailConfig);
  }

  private String normalizeEnvironment(String value) {
    String normalized = value.toLowerCase();
    if (!"development".equals(normalized) && !"test".equals(normalized) && !"production".equals(normalized)) {
      throw new ConfigurationException("Unsupported app environment: " + value);
    }
    return normalized;
  }

  private String requiredProperty(Properties properties, String key) {
    String value = trimToNull(properties.getProperty(key));
    if (value == null) {
      throw new ConfigurationException("Missing required property: " + key);
    }
    return value;
  }

  private String optionalProperty(Properties properties, String key) {
    return trimToNull(properties.getProperty(key));
  }

  private int intProperty(Properties properties, String key) {
    String value = requiredProperty(properties, key);
    try {
      return Integer.parseInt(value);
    } catch (NumberFormatException exception) {
      throw new ConfigurationException("Invalid integer property for key " + key + ": " + value, exception);
    }
  }

  private long longProperty(Properties properties, String key) {
    String value = requiredProperty(properties, key);
    try {
      return Long.parseLong(value);
    } catch (NumberFormatException exception) {
      throw new ConfigurationException("Invalid long property for key " + key + ": " + value, exception);
    }
  }

  private boolean booleanProperty(Properties properties, String key) {
    String value = requiredProperty(properties, key);
    if (!"true".equalsIgnoreCase(value) && !"false".equalsIgnoreCase(value)) {
      throw new ConfigurationException("Invalid boolean property for key " + key + ": " + value);
    }
    return Boolean.parseBoolean(value);
  }

  private String trimToNull(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }
}