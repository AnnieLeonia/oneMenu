DROP TABLE IF EXISTS menu_days CASCADE;
CREATE TABLE menu_days (
  id           SERIAL        NOT NULL,
  name         VARCHAR(255)  NOT NULL UNIQUE,
  color        VARCHAR(255),
  orderidx     INT           NOT NULL,

  PRIMARY KEY (id)
);

INSERT INTO menu_days (name, color, orderidx) VALUES
  ('Cheap Monday', '#4CAF50', 1),
  ('Meaty Tuesday', '#D32F2F', 2),
  ('Asian Wednesday', '#FF9800', 3),
  ('Fishy Thursday', '#2196F3', 4),
  ('Taco Italiano Friday', '#9C27B0', 5);

DROP TABLE IF EXISTS dishes_menu_days CASCADE;
CREATE TABLE dishes_menu_days (
  dish_id      INT           NOT NULL,
  menu_day_id  INT           NOT NULL,

  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_day_id) REFERENCES menu_days(id) ON DELETE CASCADE,
  PRIMARY KEY (dish_id, menu_day_id),
  UNIQUE (dish_id)
);
