-- Re-enable only user-defined triggers safely
DO $$ 
DECLARE
  trigger_rec RECORD;
BEGIN
  -- Get all user-defined triggers on profiles table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'profiles'::regclass 
    AND tgname IN (
      'handle_profile_creation_trigger',
      'validate_username_trigger'
    )
  LOOP
    EXECUTE format('ALTER TABLE profiles ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on auth.users table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'auth.users'::regclass 
    AND tgname IN (
      'handle_email_verification_trigger'
    )
  LOOP
    EXECUTE format('ALTER TABLE auth.users ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on occasions table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'occasions'::regclass 
    AND tgname IN (
      'add_default_occasions_trigger'
    )
  LOOP
    EXECUTE format('ALTER TABLE occasions ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on access_requests table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'access_requests'::regclass 
    AND tgname IN (
      'update_access_request_usernames_trigger'
    )
  LOOP
    EXECUTE format('ALTER TABLE access_requests ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on items table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'items'::regclass 
    AND tgname IN (
      'update_item_usernames_trigger'
    )
  LOOP
    EXECUTE format('ALTER TABLE items ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on messages table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'messages'::regclass 
    AND tgname IN (
      'update_message_timestamps_trigger'
    )
  LOOP
    EXECUTE format('ALTER TABLE messages ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on group_purchase_contributions table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'group_purchase_contributions'::regclass 
    AND tgname IN (
      'update_contribution_timestamps_trigger'
    )
  LOOP
    EXECUTE format('ALTER TABLE group_purchase_contributions ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on purchase_notifications table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'purchase_notifications'::regclass 
    AND tgname IN (
      'update_notification_timestamps_trigger'
    )
  LOOP
    EXECUTE format('ALTER TABLE purchase_notifications ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on user_favorites table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'user_favorites'::regclass 
    AND tgname IN (
      'update_favorite_username_trigger'
    )
  LOOP
    EXECUTE format('ALTER TABLE user_favorites ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on affiliate_settings table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'affiliate_settings'::regclass 
    AND tgname IN (
      'update_affiliate_settings_timestamps_trigger'
    )
  LOOP
    EXECUTE format('ALTER TABLE affiliate_settings ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

END $$;