import React from "react";
import { Route } from "react-router-dom";
import IngredientMigrationPage from "./IngredientMigrationPage";
export { default as migrationTranslation } from "./translations";
export { MIGRATION_SETTINGS_PATH } from "./constants";
export { default as SettingsMigrationLink } from "./SettingsMigrationLink";

export function MigrationRoute() {
  return (
    <Route
      exact
      path="/settings/migration"
      component={IngredientMigrationPage}
    />
  );
}
