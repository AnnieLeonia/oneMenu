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
  description  VARCHAR(255),
  active       BOOLEAN       DEFAULT FALSE,

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

  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (dish_id, category_id)
);
