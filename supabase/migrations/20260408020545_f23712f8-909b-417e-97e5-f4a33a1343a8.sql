CREATE OR REPLACE FUNCTION public.increment_departure_booked(
  _departure_id uuid,
  _pax integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_booked integer;
  current_quota integer;
BEGIN
  SELECT COALESCE(booked_count, 0), quota
  INTO current_booked, current_quota
  FROM departures
  WHERE id = _departure_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF current_booked + _pax > current_quota THEN
    RETURN false;
  END IF;

  UPDATE departures
  SET booked_count = current_booked + _pax,
      updated_at = now()
  WHERE id = _departure_id;

  RETURN true;
END;
$$;