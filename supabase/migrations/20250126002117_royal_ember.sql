-- Re-enable user-defined triggers only
DO $$ 
BEGIN
  -- Re-enable profile triggers
  ALTER TABLE profiles ENABLE TRIGGER handle_new_profile_trigger;
  ALTER TABLE profiles ENABLE TRIGGER validate_username_trigger;
  
  -- Re-enable auth triggers
  ALTER TABLE auth.users ENABLE TRIGGER handle_email_verification_trigger;
  ALTER TABLE auth.users ENABLE TRIGGER create_basic_profile_trigger;
  
  -- Re-enable occasion triggers
  ALTER TABLE profiles ENABLE TRIGGER add_default_occasions_trigger;
  
  -- Re-enable access request triggers
  ALTER TABLE access_requests ENABLE TRIGGER update_access_request_usernames_trigger;
  
  -- Re-enable item triggers
  ALTER TABLE items ENABLE TRIGGER update_item_usernames_trigger;
  
  -- Re-enable user favorites triggers
  ALTER TABLE user_favorites ENABLE TRIGGER update_favorite_username_trigger;
  
EXCEPTION 
  WHEN undefined_object THEN
    -- Ignore errors about non-existent triggers
    NULL;
END $$;