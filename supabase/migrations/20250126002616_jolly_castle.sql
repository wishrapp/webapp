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
    AND tgname NOT LIKE 'RI_ConstraintTrigger_%'
    AND tgname NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE profiles ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on auth.users table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'auth.users'::regclass 
    AND tgname NOT LIKE 'RI_ConstraintTrigger_%'
    AND tgname NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE auth.users ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on occasions table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'occasions'::regclass 
    AND tgname NOT LIKE 'RI_ConstraintTrigger_%'
    AND tgname NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE occasions ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on access_requests table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'access_requests'::regclass 
    AND tgname NOT LIKE 'RI_ConstraintTrigger_%'
    AND tgname NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE access_requests ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on items table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'items'::regclass 
    AND tgname NOT LIKE 'RI_ConstraintTrigger_%'
    AND tgname NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE items ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on messages table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'messages'::regclass 
    AND tgname NOT LIKE 'RI_ConstraintTrigger_%'
    AND tgname NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE messages ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on group_purchase_contributions table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'group_purchase_contributions'::regclass 
    AND tgname NOT LIKE 'RI_ConstraintTrigger_%'
    AND tgname NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE group_purchase_contributions ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on purchase_notifications table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'purchase_notifications'::regclass 
    AND tgname NOT LIKE 'RI_ConstraintTrigger_%'
    AND tgname NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE purchase_notifications ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on user_favorites table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'user_favorites'::regclass 
    AND tgname NOT LIKE 'RI_ConstraintTrigger_%'
    AND tgname NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE user_favorites ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

  -- Get all user-defined triggers on affiliate_settings table
  FOR trigger_rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'affiliate_settings'::regclass 
    AND tgname NOT LIKE 'RI_ConstraintTrigger_%'
    AND tgname NOT LIKE 'pg_%'
  LOOP
    EXECUTE format('ALTER TABLE affiliate_settings ENABLE TRIGGER %I', trigger_rec.tgname);
  END LOOP;

END $$;