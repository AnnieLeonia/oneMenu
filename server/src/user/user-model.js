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

module.exports = db => ({
  create: async ({ username, name, email, photo, language }) => {
    const sql = `
        INSERT INTO users (username, name, email, photo, language)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const { rows, err } = await db.query(sql, [username, name, email, photo, language]);
    return { user: rows[0], err };
  },

  update: async (id, { name, photo }) => {
    const sql = `
        UPDATE users SET (name, photo) = ($2, $3)
        WHERE id = $1 RETURNING *`;
    const { rows, err } = await db.query(sql, [id, name, photo]);
    return { user: rows[0], err };
  },

  getById: async userId => {
    const sql = "SELECT * FROM users WHERE id = $1 LIMIT 1";
    const { rows, err } = await db.query(sql, [userId]);
    return { user: rows[0], err };
  },

  getByEmail: async email => {
    const sql = "SELECT * FROM users WHERE email = $1 LIMIT 1";
    const { rows, err } = await db.query(sql, [email]);
    return { user: rows[0], err };
  },

  getAll: async () => {
    const sql = "SELECT * FROM users ORDER BY name, username, id";
    const { rows, err } = await db.query(sql);
    return { users: rows, err };
  },

  delete: async id => {
    const sql = "DELETE FROM users WHERE id = $1 RETURNING *";
    const { rows, err } = await db.query(sql, [id]);
    return { user: rows[0], err };
  }
});
