package com.eventflow.config;

import com.eventflow.dao.ConnectionManager;
import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;

public final class AppBootstrapListener implements ServletContextListener {

  private final AppConfigLoader configLoader = new AppConfigLoader();

  @Override
  public void contextInitialized(ServletContextEvent sce) {
    ServletContext context = sce.getServletContext();
    AppConfig appConfig = configLoader.load();
    context.setAttribute(AppConfig.CONTEXT_ATTRIBUTE, appConfig);
    initializeConnectionManager(context, appConfig);
    context.log(
        "EventFlow configuration loaded for environment="
            + appConfig.getEnvironment()
            + ", databaseConfigured="
            + appConfig.getDatabase().isConfigured()
            + ", mailConfigured="
            + appConfig.getMail().isConfigured());
  }

  @Override
  public void contextDestroyed(ServletContextEvent sce) {
    ServletContext context = sce.getServletContext();
    Object connectionManager = context.getAttribute(ConnectionManager.CONTEXT_ATTRIBUTE);
    if (connectionManager instanceof ConnectionManager manager) {
      manager.close();
      context.removeAttribute(ConnectionManager.CONTEXT_ATTRIBUTE);
    }
    context.removeAttribute(AppConfig.CONTEXT_ATTRIBUTE);
  }

  private void initializeConnectionManager(ServletContext context, AppConfig appConfig) {
    if (!appConfig.getDatabase().isConfigured()) {
      context.log("EventFlow database configuration is incomplete. Skipping connection pool initialization.");
      return;
    }

    ConnectionManager connectionManager = new ConnectionManager(appConfig.getDatabase());
    context.setAttribute(ConnectionManager.CONTEXT_ATTRIBUTE, connectionManager);
    context.log(
        "EventFlow database pool initialized with maxPoolSize="
            + appConfig.getDatabase().getMaxPoolSize()
            + ", minIdle="
            + appConfig.getDatabase().getMinIdle());
  }
}