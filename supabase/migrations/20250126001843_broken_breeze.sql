-- Re-enable ALL triggers on profiles table
ALTER TABLE profiles ENABLE TRIGGER ALL;

-- Re-enable ALL triggers on auth.users table
ALTER TABLE auth.users ENABLE TRIGGER ALL;

-- Re-enable ALL triggers on occasions table
ALTER TABLE occasions ENABLE TRIGGER ALL;

-- Re-enable ALL triggers on access_requests table
ALTER TABLE access_requests ENABLE TRIGGER ALL;

-- Re-enable ALL triggers on items table
ALTER TABLE items ENABLE TRIGGER ALL;

-- Re-enable ALL triggers on messages table
ALTER TABLE messages ENABLE TRIGGER ALL;

-- Re-enable ALL triggers on group_purchase_contributions table
ALTER TABLE group_purchase_contributions ENABLE TRIGGER ALL;

-- Re-enable ALL triggers on purchase_notifications table
ALTER TABLE purchase_notifications ENABLE TRIGGER ALL;

-- Re-enable ALL triggers on user_favorites table
ALTER TABLE user_favorites ENABLE TRIGGER ALL;

-- Re-enable ALL triggers on affiliate_settings table
ALTER TABLE affiliate_settings ENABLE TRIGGER ALL;