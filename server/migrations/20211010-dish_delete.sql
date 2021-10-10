ALTER TABLE dishes_categories
DROP CONSTRAINT dishes_categories_dish_id_fkey,
ADD CONSTRAINT dishes_categories_dish_id_fkey
  FOREIGN KEY (dish_id)
  REFERENCES dishes(id)
  ON DELETE CASCADE;
