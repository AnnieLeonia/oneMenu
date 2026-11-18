export const dishWithIngredients = (id, ...names) => ({
  id,
  description: `---\ningredients:\n${names
    .map((name) => `  - name: ${name}`)
    .join("\n")}\n---`,
});

export const repeatIngredientDishes = (name, count, startId = 1) =>
  Array.from({ length: count }, (_, i) =>
    dishWithIngredients(startId + i, name)
  );
