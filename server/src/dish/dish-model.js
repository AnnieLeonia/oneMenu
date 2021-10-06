module.exports = db => ({
  create: async ({ name, description }) => {
    const sql =
      "INSERT INTO dishes (name, description) VALUES ($1, $2) RETURNING *";
    const { rows, err } = await db.query(sql, [name, description]);
    return { category: rows[0], err };
  },

  update: async (id, { name, description, category }) => {
    try {
      await db.query("BEGIN");

      const { rows, err } = await db.query(
        `UPDATE dishes SET (name, description) = ($2, $3)
        WHERE id = $1`,
        [id, name, description]
      );
      if (err) throw err;

      if (category) {
        const { err } = await db.query(
          `INSERT INTO dishes_categories (dish_id, category_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING`,
          [id, category]
        );
        if (err) throw err;
      }

      await db.query("COMMIT");

      return { category: rows[0], err };
    } catch (err) {
      await db.query("ROLLBACK");
      return { err };
    }
  },

  toggleActive: async (id) => {
    const sql = 'UPDATE dishes SET active = NOT active WHERE id = $1';
    const { rows, err } = await db.query(sql, [id]);
    return { category: rows[0], err };
  },

  delete: async id => {
    const sql = "DELETE FROM dishes WHERE id = $1";
    const { rows, err } = await db.query(sql, [id]);
    return { category: rows[0], err };
  },

  getAll: async () => {
    const { rows, err } = await db.query(`
      SELECT * FROM dishes
      LEFT JOIN dishes_categories ON dishes.id = dishes_categories.dish_id
    `);
    return { dishes: rows, err };
  }
});
