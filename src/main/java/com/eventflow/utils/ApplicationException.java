package com.eventflow.utils;

public class ApplicationException extends RuntimeException {

  private final int statusCode;
  private final ErrorCode errorCode;
  private final boolean logStackTrace;

  public ApplicationException(String message, int statusCode, ErrorCode errorCode) {
    this(message, statusCode, errorCode, true, null);
  }

  public ApplicationException(
      String message,
      int statusCode,
      ErrorCode errorCode,
      boolean logStackTrace,
      Throwable cause) {
    super(message, cause);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.logStackTrace = logStackTrace;
  }

  public int getStatusCode() {
    return statusCode;
  }

  public ErrorCode getErrorCode() {
    return errorCode;
  }

  public boolean shouldLogStackTrace() {
    return logStackTrace;
  }
}