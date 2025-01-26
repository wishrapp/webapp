-- Re-enable only user-defined triggers
DO $$ 
BEGIN
  -- Profile triggers
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_new_profile_trigger') THEN
    ALTER TABLE profiles ENABLE TRIGGER handle_new_profile_trigger;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'validate_username_trigger') THEN
    ALTER TABLE profiles ENABLE TRIGGER validate_username_trigger;
  END IF;

  -- Auth triggers
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_email_verification_trigger') THEN
    ALTER TABLE auth.users ENABLE TRIGGER handle_email_verification_trigger;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'create_basic_profile_trigger') THEN
    ALTER TABLE auth.users ENABLE TRIGGER create_basic_profile_trigger;
  END IF;

  -- Occasion triggers
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'add_default_occasions_trigger') THEN
    ALTER TABLE profiles ENABLE TRIGGER add_default_occasions_trigger;
  END IF;

  -- Access request triggers
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_access_request_usernames_trigger') THEN
    ALTER TABLE access_requests ENABLE TRIGGER update_access_request_usernames_trigger;
  END IF;

  -- Item triggers
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_item_usernames_trigger') THEN
    ALTER TABLE items ENABLE TRIGGER update_item_usernames_trigger;
  END IF;

  -- User favorites triggers
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_favorite_username_trigger') THEN
    ALTER TABLE user_favorites ENABLE TRIGGER update_favorite_username_trigger;
  END IF;

END $$;