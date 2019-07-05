DROP TABLE IF EXISTS chefs CASCADE;
CREATE TABLE chefs
(
    id           SERIAL          NOT NULL,
    name         VARCHAR(255)    NOT NULL,
    email        VARCHAR(255)    NOT NULL UNIQUE,
    photo        VARCHAR(255)    NOT NULL,
    "createdAt"  TIMESTAMP       NOT NULL,
    "updatedAt"  TIMESTAMP       NOT NULL,

    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS days CASCADE;
CREATE TABLE days
(
    id           SERIAL          NOT NULL,
    name         VARCHAR(255)    NOT NULL UNIQUE,
    weekday      INT             NOT NULL,
    "chefId"     INT,
    "createdAt"  TIMESTAMP       NOT NULL,
    "updatedAt"  TIMESTAMP       NOT NULL,

    FOREIGN KEY ("chefId") REFERENCES chefs(id) ON DELETE SET NULL,
    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS dishes CASCADE;
CREATE TABLE dishes
(
    id           SERIAL          NOT NULL,
    name         VARCHAR(255)    NOT NULL,
    date         DATE            NOT NULL UNIQUE,
    "dayId"      INT,
    "createdAt"  TIMESTAMP       NOT NULL,
    "updatedAt"  TIMESTAMP       NOT NULL,

    FOREIGN KEY ("dayId") REFERENCES days(id) ON DELETE SET NULL,
    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS sidetypes CASCADE;
CREATE TABLE sidetypes
(
    id           SERIAL          NOT NULL,
    name         VARCHAR(255)    NOT NULL UNIQUE,
    "createdAt"  TIMESTAMP       NOT NULL,
    "updatedAt"  TIMESTAMP       NOT NULL,

    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS sides CASCADE;
CREATE TABLE sides
(
    id           SERIAL          NOT NULL,
    name         VARCHAR(255)    NOT NULL,
    "sidetypeId" INT,
    "dishId"     INT             NOT NULL,
    "createdAt"  TIMESTAMP       NOT NULL,
    "updatedAt"  TIMESTAMP       NOT NULL,

    FOREIGN KEY ("sidetypeId") REFERENCES sidetypes(id) ON DELETE SET NULL,
    FOREIGN KEY ("dishId") REFERENCES dishes(id) ON DELETE CASCADE,
    PRIMARY KEY (id)
);

