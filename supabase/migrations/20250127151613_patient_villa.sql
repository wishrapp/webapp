-- Create function to handle access request creation with message
CREATE OR REPLACE FUNCTION create_access_request(
  p_requester_id uuid,
  p_target_id uuid,
  p_message text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Start transaction
  BEGIN
    -- Create the access request
    INSERT INTO access_requests (
      requester_id,
      target_id,
      status,
      created_at,
      updated_at
    ) VALUES (
      p_requester_id,
      p_target_id,
      'pending',
      NOW(),
      NOW()
    );

    -- Create the message
    INSERT INTO messages (
      sender_id,
      recipient_id,
      subject,
      content,
      read,
      created_at
    ) VALUES (
      p_requester_id,
      p_target_id,
      'New Access Request',
      p_message,
      false,
      NOW()
    );

    -- Commit transaction
    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback on error
      ROLLBACK;
      RAISE;
  END;
END;
$$;