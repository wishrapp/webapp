-- Disable all profile triggers
ALTER TABLE profiles DISABLE TRIGGER verify_new_profile_trigger;
ALTER TABLE profiles DISABLE TRIGGER sync_email_to_auth_users_trigger;
ALTER TABLE auth.users DISABLE TRIGGER sync_email_from_auth_users_trigger;