CREATE OR REPLACE FUNCTION notify_dishes_changes()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'dishes_changed',
    json_build_object(
      'operation', TG_OP,
      'record', row_to_json(NEW),
      'old', row_to_json(OLD)
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;