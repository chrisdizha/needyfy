-- Update the handle_new_user function to properly handle user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
exception
  when others then
    -- Log the error but don't fail the user creation
    raise log 'Error creating profile for user %: %', new.id, SQLERRM;
    return new;
end;
$$;