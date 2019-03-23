DROP TABLE IF EXISTS chefs CASCADE;
CREATE TABLE chefs
(
    id          SERIAL          NOT NULL,
    name        VARCHAR(255)    NOT NULL,
    email       VARCHAR(255)    NOT NULL,
    photo       VARCHAR(255)    NOT NULL,
    language    VARCHAR(255)    NOT NULL,

    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS days CASCADE;
CREATE TABLE days
(
    id          SERIAL          NOT NULL,
    name        VARCHAR(255)    NOT NULL UNIQUE,
    weekday     INT             NOT NULL,
    chef        INT,

    FOREIGN KEY (chef) REFERENCES chefs(id) ON DELETE SET NULL,
    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS dishes CASCADE;
CREATE TABLE dishes
(
    id          SERIAL          NOT NULL,
    name        VARCHAR(255)    NOT NULL,
    date        VARCHAR(255)    NOT NULL,
    day         INT,

    FOREIGN KEY (day) REFERENCES days(id) ON DELETE SET NULL,
    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS sidetypes CASCADE;
CREATE TABLE sidetypes
(
    id          SERIAL          NOT NULL,
    name        VARCHAR(255)    NOT NULL UNIQUE,

    PRIMARY KEY (id)
);

DROP TABLE IF EXISTS sides CASCADE;
CREATE TABLE sides
(
    id          SERIAL          NOT NULL,
    name        VARCHAR(255)    NOT NULL,
    sidetype    INT,
    dish        INT             NOT NULL,

    FOREIGN KEY (sidetype) REFERENCES sidetypes(id) ON DELETE SET NULL,
    FOREIGN KEY (dish) REFERENCES dishes(id) ON DELETE CASCADE,
    PRIMARY KEY (id)
);

