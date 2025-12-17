--SQL TABLE SCHEMAS
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id           SERIAL        NOT NULL,
  name         VARCHAR(255)  NOT NULL,
  username     VARCHAR(255)  NOT NULL,
  email        VARCHAR(255)  NOT NULL,
  photo        VARCHAR(255)  NOT NULL,
  language     VARCHAR(255)  NOT NULL,

  PRIMARY KEY (email)
);

DROP TABLE IF EXISTS dishes CASCADE;
CREATE TABLE dishes (
  id           SERIAL        NOT NULL,
  name         VARCHAR(255)  NOT NULL UNIQUE,
  description  TEXT,
  img          VARCHAR(255),
  active       BOOLEAN       DEFAULT TRUE,

  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS categories CASCADE;
CREATE TABLE categories (
  id           SERIAL        NOT NULL,
  name         VARCHAR(255)  NOT NULL UNIQUE,
  color        VARCHAR(255),
  orderidx     SERIAL        NOT NULL,

  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS dishes_categories CASCADE;
CREATE TABLE dishes_categories (
  dish_id      INT           NOT NULL,
  category_id  INT           NOT NULL,

  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (dish_id, category_id)
);

DROP TABLE IF EXISTS menu_days CASCADE;
CREATE TABLE menu_days (
  id           SERIAL        NOT NULL,
  name         VARCHAR(255)  NOT NULL UNIQUE,
  color        VARCHAR(255),
  orderidx     INT           NOT NULL,

  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS dishes_menu_days CASCADE;
CREATE TABLE dishes_menu_days (
  dish_id      INT           NOT NULL,
  menu_day_id  INT           NOT NULL,

  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_day_id) REFERENCES menu_days(id) ON DELETE CASCADE,
  PRIMARY KEY (dish_id, menu_day_id),
  UNIQUE (dish_id)
);
