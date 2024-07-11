module.exports = (db) => ({
  create: async ({ name, img, description }) => {
    const sql =
      "INSERT INTO dishes (name, img, description) VALUES ($1, $2, $3) RETURNING *";
    const { rows, err } = await db.query(sql, [name, img, description]);
    return { dish: rows[0], err };
  },

  update: async (id, { name, img, description, category_ids }) => {
    try {
      await db.query("BEGIN");

      const { rows, err } = await db.query(
        `
        UPDATE dishes SET (name, img, description) = ($2, $3, $4)
        WHERE id = $1 RETURNING *`,
        [id, name, img, description]
      );
      if (err) throw err;

      if (category_ids) {
        const { err } = await db.query(
          `
          DELETE FROM dishes_categories
          WHERE dish_id = $1
        `,
          [id]
        );
        if (err) throw err;

        // Fix this into one INSERT query with helper method
        category_ids
          .map(Number)
          .filter(Boolean)
          .forEach(async (category) => {
            const { err } = await db.query(
              `
            INSERT INTO dishes_categories (dish_id, category_id)
            VALUES ($1, $2)
          `,
              [id, category]
            );
            if (err) throw err;
          });
      }

      await db.query("COMMIT");

      return { dish: rows[0], err };
    } catch (err) {
      await db.query("ROLLBACK");
      return { err };
    }
  },

  toggleActive: async (id) => {
    const sql =
      "UPDATE dishes SET active = NOT active WHERE id = $1 RETURNING *";
    const { rows, err } = await db.query(sql, [id]);
    return { dish: rows[0], err };
  },

  delete: async (id) => {
    const sql = "DELETE FROM dishes WHERE id = $1 RETURNING *";
    const { rows, err } = await db.query(sql, [id]);
    return { dish: rows[0], err };
  },

  getById: async (id) => {
    const { rows, err } = await db.query(`
      SELECT dishes.*, ARRAY_AGG(category_id) AS category_ids FROM dishes
      LEFT JOIN dishes_categories ON id = dishes_categories.dish_id
      WHERE id = ${id}
      GROUP BY name, id
    `);
    return { dish: rows[0], err };
  },

  getAll: async () => {
    const { rows, err } = await db.query(`
      SELECT id, name, description, img, active, ARRAY_AGG(category_id) AS category_ids FROM dishes
      LEFT JOIN dishes_categories ON id = dishes_categories.dish_id
      GROUP BY name, id ORDER BY id
    `);
    return { dishes: rows, err };
  },
});
