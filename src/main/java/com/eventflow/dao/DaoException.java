package com.eventflow.dao;

public final class DaoException extends RuntimeException {

  public DaoException(String message, Throwable cause) {
    super(message, cause);
  }
}