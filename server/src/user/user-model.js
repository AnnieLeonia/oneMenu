/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         photo:
 *           type: string
 *         language:
 *           type: string
 */

const { keyValuePairs } = require("../utils");

module.exports = (db) => ({
  create: async (user) => {
    const valid = ["username", "name", "email", "photo", "language"];
    const { keys, values, indices } = keyValuePairs(valid, user);

    const sql = `
        INSERT INTO users (${keys})
        VALUES (${indices}) RETURNING *`;
    const { rows, err } = await db.query(sql, values);
    return { user: rows[0], err };
  },

  update: async (id, user) => {
    const valid = ["username", "name", "photo", "language"];
    const { keyIndices, values } = keyValuePairs(valid, user);
    const sql = `
        UPDATE users SET ${keyIndices}
        WHERE id = ${id} RETURNING *`;
    const { rows, err } = await db.query(sql, values);
    return { user: rows[0], err };
  },

  getById: async (userId) => {
    const sql = "SELECT * FROM users WHERE id = $1 LIMIT 1";
    const { rows, err } = await db.query(sql, [userId]);
    return { user: rows[0], err };
  },

  getByEmail: async (email) => {
    const sql = "SELECT * FROM users WHERE email = $1 LIMIT 1";
    const { rows, err } = await db.query(sql, [email]);
    return { user: rows[0], err };
  },

  getAll: async () => {
    const sql = "SELECT * FROM users ORDER BY name, username, id";
    const { rows, err } = await db.query(sql);
    return { users: rows, err };
  },

  delete: async (id) => {
    const sql = "DELETE FROM users WHERE id = $1 RETURNING *";
    const { rows, err } = await db.query(sql, [id]);
    return { user: rows[0], err };
  },
});
