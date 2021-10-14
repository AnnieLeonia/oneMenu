module.exports = (db) => ({
  create: async ({ name }) => {
    const sql = "INSERT INTO categories (name) VALUES ($1) RETURNING *";
    const { rows, err } = await db.query(sql, [name]);
    return { category: rows[0], err };
  },

  update: async (id, { name, color }) => {
    const sql = "UPDATE categories SET name = $2, color = $3 WHERE id = $1";
    const { rows, err } = await db.query(sql, [id, name, color]);
    return { category: rows[0], err };
  },

  delete: async (id) => {
    const sql = "DELETE FROM categories WHERE id = $1";
    const { rows, err } = await db.query(sql, [id]);
    return { category: rows[0], err };
  },

  getAll: async () => {
    const { rows, err } = await db.query("SELECT * FROM categories");
    return { categories: rows, err };
  },

  reorder: async ({ start_index, end_index }) => {
    try {
      await db.query("BEGIN");

      await db.query(`
        UPDATE categories
        SET orderidx = 0
        WHERE orderidx = ${start_index};\n`);

      // MOVE UP
      if (start_index - end_index > 0) {
        await db.query(`
          UPDATE categories
          SET orderidx = (orderidx + 1)
          WHERE orderidx >= ${end_index} AND orderidx < ${start_index};\n`);
      }
      // MOVE DOWN
      if (start_index - end_index < 0) {
        await db.query(`
          UPDATE categories
          SET orderidx = (orderidx - 1)
          WHERE orderidx <= ${end_index} AND orderidx > ${start_index};\n`);
      }

      await db.query(`
        UPDATE categories
        SET orderidx = ${end_index}
        WHERE orderidx = 0;\n`);

      const { rows } = await db.query(`
        SELECT CASE WHEN
        COUNT(DISTINCT orderidx) = COUNT(orderidx)
        THEN 1 ELSE 0 END AS unique
        FROM categories;`);

      const [{ unique }] = rows;
      if (unique) {
        await db.query("COMMIT");
      } else {
        await db.query("ROLLBACK");
      }
    } catch (err) {
      await db.query("ROLLBACK");
      return { err };
    }
    return {};
  },
});
