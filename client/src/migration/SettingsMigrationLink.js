import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { MIGRATION_SETTINGS_PATH } from "./constants";
import "./styles.css";

const SettingsMigrationLink = ({ translate, isLoggedIn }) => {
  if (!isLoggedIn) return null;
  return (
    <p className="settings-migration-link-wrap">
      <Link
        to={MIGRATION_SETTINGS_PATH}
        className="migrationBtn settings-migration-link"
      >
        {translate("settings.migration.link")}
      </Link>
    </p>
  );
};

SettingsMigrationLink.propTypes = {
  translate: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
};

export default SettingsMigrationLink;
