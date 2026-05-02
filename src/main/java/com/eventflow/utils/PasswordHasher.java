package com.eventflow.utils;


import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;
import java.util.Locale;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public final class PasswordHasher {

  private static final String ALGORITHM = "PBKDF2WithHmacSHA256";
  private static final String PREFIX = "pbkdf2_sha256";
  private static final int ITERATIONS = 210000;
  private static final int SALT_LENGTH = 16;
  private static final int KEY_LENGTH_BITS = 256;

  private final SecureRandom secureRandom = new SecureRandom();

  public String hash(String rawPassword) {
    byte[] salt = new byte[SALT_LENGTH];
    secureRandom.nextBytes(salt);
    byte[] derivedKey = deriveKey(rawPassword, salt, ITERATIONS);

    return String.join(
        "$",
        PREFIX,
        String.valueOf(ITERATIONS),
        Base64.getEncoder().encodeToString(salt),
        Base64.getEncoder().encodeToString(derivedKey));
  }

  public boolean matches(String rawPassword, String storedHash) {
    if (rawPassword == null || storedHash == null || storedHash.isBlank()) {
      return false;
    }

    String[] parts = storedHash.split("\\$");
    if (parts.length != 4 || !PREFIX.equals(parts[0])) {
      return false;
    }

    try {
      int iterations = Integer.parseInt(parts[1]);
      byte[] salt = Base64.getDecoder().decode(parts[2]);
      byte[] expectedHash = Base64.getDecoder().decode(parts[3]);
      byte[] actualHash = deriveKey(rawPassword, salt, iterations);
      return MessageDigest.isEqual(expectedHash, actualHash);
    } catch (IllegalArgumentException exception) {
      return false;
    }
  }

  private byte[] deriveKey(String rawPassword, byte[] salt, int iterations) {
    PBEKeySpec keySpec = new PBEKeySpec(
        rawPassword.toCharArray(),
        salt,
        iterations,
        KEY_LENGTH_BITS);

    try {
      SecretKeyFactory keyFactory = SecretKeyFactory.getInstance(ALGORITHM);
      return keyFactory.generateSecret(keySpec).getEncoded();
    } catch (NoSuchAlgorithmException | InvalidKeySpecException exception) {
      throw new IllegalStateException("Failed to derive password hash", exception);
    } finally {
      keySpec.clearPassword();
    }
  }

  public static String normalizeForStorage(String value) {
    return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
  }
}