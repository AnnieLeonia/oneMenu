module.exports = (db) => ({
  create: async ({ name, img, description }) => {
    const sql =
      "INSERT INTO dishes (name, img, description) VALUES ($1, $2, $3) RETURNING *";
    const { rows, err } = await db.query(sql, [name, img, description]);
    return { dish: rows[0], err };
  },

  update: async (id, { name, img, description, category_ids, menu_day_id }) => {
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

      if (menu_day_id !== undefined) {
        const { err } = await db.query(
          `
          DELETE FROM dishes_menu_days
          WHERE dish_id = $1
        `,
          [id]
        );
        if (err) throw err;

        // Insert menu day assignment (only one allowed due to UNIQUE constraint)
        const menuDayId = Number(menu_day_id);
        if (menuDayId) {
          const { err } = await db.query(
            `
            INSERT INTO dishes_menu_days (dish_id, menu_day_id)
            VALUES ($1, $2)
          `,
            [id, menuDayId]
          );
          if (err) throw err;
        }
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
      SELECT dishes.*,
        ARRAY_AGG(DISTINCT dishes_categories.category_id) AS category_ids,
        MAX(dishes_menu_days.menu_day_id) AS menu_day_id
      FROM dishes
      LEFT JOIN dishes_categories ON dishes.id = dishes_categories.dish_id
      LEFT JOIN dishes_menu_days ON dishes.id = dishes_menu_days.dish_id
      WHERE dishes.id = ${id}
      GROUP BY dishes.id
    `);
    return { dish: rows[0], err };
  },

  getAll: async () => {
    const { rows, err } = await db.query(`
      SELECT dishes.id, dishes.name, dishes.description, dishes.img, dishes.active,
        ARRAY_AGG(DISTINCT dishes_categories.category_id) AS category_ids,
        MAX(dishes_menu_days.menu_day_id) AS menu_day_id
      FROM dishes
      LEFT JOIN dishes_categories ON dishes.id = dishes_categories.dish_id
      LEFT JOIN dishes_menu_days ON dishes.id = dishes_menu_days.dish_id
      GROUP BY dishes.id ORDER BY dishes.id
    `);
    return { dishes: rows, err };
  },
});
