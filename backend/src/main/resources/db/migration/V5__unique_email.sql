CREATE UNIQUE INDEX IF NOT EXISTS app_user_email_key ON app_user (LOWER(email));
