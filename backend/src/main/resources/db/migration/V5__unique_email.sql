CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS app_user_email_key ON app_user (LOWER(email));
