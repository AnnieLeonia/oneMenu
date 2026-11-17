# Dish verify UI (temporary)

Compare each dish’s database `description` with the matching file under `tmp/dish-verify/`. **Apply** writes the verify file’s raw markdown to PostgreSQL.

Rendering uses `client/src/utils/recipeIngredients/` (YAML frontmatter + legacy markdown).

When migration is finished:

1. Delete `client/src/migration/`
2. Delete `server/src/dish/dish-verify.js` and the `/__/dish-verify/:id` route in `dish-route.js`
3. Remove `MigrationRoute` from `client/src/containers/App.js`
4. Remove `SettingsMigrationLink` from `client/src/containers/settings/index.js`
5. Remove `migrationTranslation` from `client/src/store.js`
6. Remove or repurpose `tmp/dish-verify/` if no longer needed