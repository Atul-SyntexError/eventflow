START TRANSACTION;

UPDATE users
SET password_hash = 'pbkdf2_sha256$210000$4E0NuHGlEtNwLDMHkPiNKw==$7aBz0xzFXvxEyP12jITP1ej9skBlpZR/ZZy6mVnR0jY='
WHERE email = 'admin@eventflow.local';

UPDATE users
SET password_hash = 'pbkdf2_sha256$210000$GDNyfqhT04sva+54e/Hunw==$ScaAOvFP0/Vud97z70ofn+tTCCxoFn/mt3h5xbZkqfM='
WHERE email = 'organizer@eventflow.local';

UPDATE users
SET password_hash = 'pbkdf2_sha256$210000$10LWjMmROcMwUD2kDz8dZw==$v3DodYbjYxwXhccXMgPdDxHj9mIp3AbtUe9z7aYiKzY='
WHERE email = 'volunteer@eventflow.local';

UPDATE users
SET password_hash = 'pbkdf2_sha256$210000$ZLMW0akNnzkHlG8liIAMlw==$9WjN1JBnOvUwr3jBZWaLj/11/qwvP5BiGQBniLLXpPc='
WHERE email = 'student@eventflow.local';

COMMIT;