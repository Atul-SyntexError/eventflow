package com.eventflow.config;

public final class AppConfig {

  public static final String CONTEXT_ATTRIBUTE = "eventflow.appConfig";

  private final String appName;
  private final String environment;
  private final String baseUrl;
  private final DatabaseConfig database;
  private final MailConfig mail;

  public AppConfig(
      String appName,
      String environment,
      String baseUrl,
      DatabaseConfig database,
      MailConfig mail) {
    this.appName = appName;
    this.environment = environment;
    this.baseUrl = baseUrl;
    this.database = database;
    this.mail = mail;
  }

  public String getAppName() {
    return appName;
  }

  public String getEnvironment() {
    return environment;
  }

  public String getBaseUrl() {
    return baseUrl;
  }

  public DatabaseConfig getDatabase() {
    return database;
  }

  public MailConfig getMail() {
    return mail;
  }

  public boolean isProduction() {
    return "production".equals(environment);
  }

  static boolean hasText(String value) {
    return value != null && !value.isBlank();
  }

  public static final class DatabaseConfig {

    private final String driverClassName;
    private final String url;
    private final String username;
    private final String password;
    private final int minIdle;
    private final int maxPoolSize;
    private final long connectionTimeoutMs;

    public DatabaseConfig(
        String driverClassName,
        String url,
        String username,
        String password,
        int minIdle,
        int maxPoolSize,
        long connectionTimeoutMs) {
      this.driverClassName = driverClassName;
      this.url = url;
      this.username = username;
      this.password = password;
      this.minIdle = minIdle;
      this.maxPoolSize = maxPoolSize;
      this.connectionTimeoutMs = connectionTimeoutMs;
    }

    public String getDriverClassName() {
      return driverClassName;
    }

    public String getUrl() {
      return url;
    }

    public String getUsername() {
      return username;
    }

    public String getPassword() {
      return password;
    }

    public int getMinIdle() {
      return minIdle;
    }

    public int getMaxPoolSize() {
      return maxPoolSize;
    }

    public long getConnectionTimeoutMs() {
      return connectionTimeoutMs;
    }

    public boolean isConfigured() {
      return hasText(url) && hasText(username) && hasText(password);
    }
  }

  public static final class MailConfig {

    private final String host;
    private final int port;
    private final String username;
    private final String password;
    private final String fromAddress;
    private final boolean tlsEnabled;
    private final int connectionTimeoutMs;
    private final int readTimeoutMs;
    private final int writeTimeoutMs;

    public MailConfig(
        String host,
        int port,
        String username,
        String password,
        String fromAddress,
        boolean tlsEnabled,
        int connectionTimeoutMs,
        int readTimeoutMs,
        int writeTimeoutMs) {
      this.host = host;
      this.port = port;
      this.username = username;
      this.password = password;
      this.fromAddress = fromAddress;
      this.tlsEnabled = tlsEnabled;
      this.connectionTimeoutMs = connectionTimeoutMs;
      this.readTimeoutMs = readTimeoutMs;
      this.writeTimeoutMs = writeTimeoutMs;
    }

    public String getHost() {
      return host;
    }

    public int getPort() {
      return port;
    }

    public String getUsername() {
      return username;
    }

    public String getPassword() {
      return password;
    }

    public String getFromAddress() {
      return fromAddress;
    }

    public boolean isTlsEnabled() {
      return tlsEnabled;
    }

    public int getConnectionTimeoutMs() {
      return connectionTimeoutMs;
    }

    public int getReadTimeoutMs() {
      return readTimeoutMs;
    }

    public int getWriteTimeoutMs() {
      return writeTimeoutMs;
    }

    public boolean isConfigured() {
      return hasText(host) && hasText(username) && hasText(password) && hasText(fromAddress);
    }
  }
}