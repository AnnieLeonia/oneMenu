module.exports = (db) => ({
  getAll: async () => {
    const { rows, err } = await db.query(
      "SELECT * FROM menu_days ORDER BY orderidx"
    );
    return { menuDays: rows, err };
  },
});
