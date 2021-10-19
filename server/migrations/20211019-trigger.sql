CREATE TRIGGER dishes_changed
AFTER INSERT OR UPDATE OR DELETE
ON dishes
FOR EACH ROW
EXECUTE PROCEDURE notify_dishes_changes();