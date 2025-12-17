-- Create menu_days table
DROP TABLE IF EXISTS menu_days CASCADE;
CREATE TABLE menu_days (
  id           SERIAL        NOT NULL,
  name         VARCHAR(255)  NOT NULL UNIQUE,
  orderidx     INT           NOT NULL,

  PRIMARY KEY (id)
);

-- Seed the 5 pre-defined days
INSERT INTO menu_days (name, orderidx) VALUES
  ('Cheap Monday', 1),
  ('Meaty Tuesday', 2),
  ('Asian Wednesday', 3),
  ('Fishy Thursday', 4),
  ('Taco Italiano Friday', 5);

-- Create junction table for dishes and menu_days
DROP TABLE IF EXISTS dishes_menu_days CASCADE;
CREATE TABLE dishes_menu_days (
  dish_id      INT           NOT NULL,
  menu_day_id  INT           NOT NULL,

  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_day_id) REFERENCES menu_days(id) ON DELETE CASCADE,
  PRIMARY KEY (dish_id, menu_day_id),
  UNIQUE (dish_id)
);

-- Assign dishes to menu days based on their categories
-- Cheap Monday: "Husmanskost"
INSERT INTO dishes_menu_days (dish_id, menu_day_id)
SELECT DISTINCT dc.dish_id, md.id
FROM dishes_categories dc
JOIN categories c ON dc.category_id = c.id
JOIN menu_days md ON md.name = 'Cheap Monday'
WHERE c.name = 'Husmanskost'
ON CONFLICT (dish_id) DO NOTHING;

-- Meaty Tuesday: "Kött"
INSERT INTO dishes_menu_days (dish_id, menu_day_id)
SELECT DISTINCT dc.dish_id, md.id
FROM dishes_categories dc
JOIN categories c ON dc.category_id = c.id
JOIN menu_days md ON md.name = 'Meaty Tuesday'
WHERE c.name = 'Kött'
ON CONFLICT (dish_id) DO NOTHING;

-- Asian Wednesday: "Asiatisk"
INSERT INTO dishes_menu_days (dish_id, menu_day_id)
SELECT DISTINCT dc.dish_id, md.id
FROM dishes_categories dc
JOIN categories c ON dc.category_id = c.id
JOIN menu_days md ON md.name = 'Asian Wednesday'
WHERE c.name = 'Asiatisk'
ON CONFLICT (dish_id) DO NOTHING;

-- Fishy Thursday: "Fisk"
INSERT INTO dishes_menu_days (dish_id, menu_day_id)
SELECT DISTINCT dc.dish_id, md.id
FROM dishes_categories dc
JOIN categories c ON dc.category_id = c.id
JOIN menu_days md ON md.name = 'Fishy Thursday'
WHERE c.name = 'Fisk'
ON CONFLICT (dish_id) DO NOTHING;

