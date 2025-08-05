-- Create a test notification function to verify the system works
CREATE OR REPLACE FUNCTION public.create_test_notification()
RETURNS void AS $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Get the first user from profiles (for testing purposes)
  SELECT id INTO test_user_id FROM public.profiles LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Create a test notification
    PERFORM public.send_notification(
      test_user_id,
      'Welcome to the notification system!',
      'Your notification system is now working properly. This is a test notification.',
      'info'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Call the function to create a test notification
SELECT public.create_test_notification();