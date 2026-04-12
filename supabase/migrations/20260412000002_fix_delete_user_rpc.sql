-- Improved function to delete a user from auth.users
-- This requires super_admin or owner role
-- This version includes better error handling and cascading deletes

-- First, ensure the function exists and is properly defined
DROP FUNCTION IF EXISTS public.delete_user_by_admin(UUID) CASCADE;

CREATE FUNCTION public.delete_user_by_admin(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    caller_role TEXT;
    deleted_count INT;
BEGIN
    -- Check if the caller is a super_admin or owner
    SELECT role INTO caller_role
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'owner')
    LIMIT 1;

    IF caller_role IS NULL THEN
        RAISE EXCEPTION 'Only super_admin or owner can delete users';
    END IF;

    -- Prevent self-deletion
    IF auth.uid() = target_user_id THEN
        RAISE EXCEPTION 'You cannot delete your own account';
    END IF;

    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Delete related data first (in case cascading isn't set up)
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    DELETE FROM public.profiles WHERE user_id = target_user_id;
    
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = target_user_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'User deleted successfully',
        'deleted_count', deleted_count
    );
END;
$$;

-- Grant access to authenticated users (the function itself checks for roles)
GRANT EXECUTE ON FUNCTION public.delete_user_by_admin(UUID) TO authenticated;
