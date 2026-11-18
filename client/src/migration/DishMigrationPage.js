import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import { Link } from "react-router-dom";
import { find, sortBy } from "lodash/fp";

import SyncMigrationCompare from "./SyncMigrationCompare";
import buildVerifyPreview from "./buildVerifyPreview";
import fetchDishVerifyMarkdown from "./fetchDishVerifyMarkdown";
import { MIGRATION_SETTINGS_PATH } from "./constants";
import { editDish, fetchDishes } from "../actions/dishes";
import { DEFAULT_DESCRIPTION } from "../constants/dishes";

import "./styles.css";

function dishMeta(dish) {
  if (!dish) return null;
  return {
    id: dish.id,
    name: dish.name,
    img: dish.img,
    description: dish.description,
    categoryIds: dish.categoryIds || dish.category_ids || [],
    menuDayId: dish.menu_day_id || dish.menuDayId,
  };
}

class DishMigrationPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDishId: "",
      verifyMarkdown: null,
      verifyFile: null,
      verifyLoading: false,
      verifyError: null,
      applying: false,
    };
  }

  componentDidMount() {
    const { dishes, loadDishes } = this.props;
    if (!dishes.length) {
      loadDishes();
    }
  }

  selectedDish() {
    const { dishes } = this.props;
    const id = Number(this.state.selectedDishId);
    if (!id) return null;
    return find({ id }, dishes) || null;
  }

  currentDescription() {
    const dish = this.selectedDish();
    if (!dish) return "";
    if (dish.description) return dish.description;
    return DEFAULT_DESCRIPTION(dish);
  }

  verifyPreview() {
    const description = this.currentDescription();
    if (!description && !this.state.selectedDishId) return null;
    const { verifyMarkdown } = this.state;
    return buildVerifyPreview(description, verifyMarkdown);
  }

  sortedDishes() {
    const { dishes } = this.props;
    return sortBy("name", dishes || []);
  }

  currentDishIndex(sorted) {
    const id = Number(this.state.selectedDishId);
    if (!id) return -1;
    return sorted.findIndex((d) => d.id === id);
  }

  loadVerifyForDish = async (dishId) => {
    const id = Number(dishId);
    if (!id) {
      this.setState({
        verifyMarkdown: null,
        verifyFile: null,
        verifyLoading: false,
        verifyError: null,
      });
      return;
    }

    this.setState({ verifyLoading: true, verifyError: null });
    try {
      const { markdown, file } = await fetchDishVerifyMarkdown(id);
      this.setState({
        verifyMarkdown: markdown,
        verifyFile: file,
        verifyLoading: false,
      });
    } catch (err) {
      this.setState({
        verifyMarkdown: null,
        verifyFile: null,
        verifyLoading: false,
        verifyError: err.message || String(err),
      });
    }
  };

  selectDishById = (dishId) => {
    this.setState({
      selectedDishId: dishId ? String(dishId) : "",
      verifyMarkdown: null,
      verifyFile: null,
      verifyError: null,
    });
    if (dishId) {
      this.loadVerifyForDish(dishId);
    }
  };

  onSelectDish = (evt) => {
    this.selectDishById(evt.target.value);
  };

  onPrevDish = () => {
    const sorted = this.sortedDishes();
    const index = this.currentDishIndex(sorted);
    if (index > 0) {
      this.selectDishById(sorted[index - 1].id);
    }
  };

  onNextDish = () => {
    const sorted = this.sortedDishes();
    const index = this.currentDishIndex(sorted);
    if (sorted.length === 0) return;
    if (index < 0) {
      this.selectDishById(sorted[0].id);
      return;
    }
    if (index < sorted.length - 1) {
      this.selectDishById(sorted[index + 1].id);
    }
  };

  onApply = async () => {
    const preview = this.verifyPreview();
    const dish = dishMeta(this.selectedDish());
    const { applyMigration } = this.props;
    if (!preview || !preview.changed || !dish || !preview.verifyMarkdown)
      return;

    this.setState({ applying: true });
    try {
      await applyMigration({
        ...dish,
        description: preview.verifyMarkdown,
      });
      this.setState({ verifyMarkdown: preview.verifyMarkdown });
    } finally {
      this.setState({ applying: false });
    }
  };

  render() {
    const { translate, isLoggedIn, dishes } = this.props;
    const { selectedDishId, verifyLoading, verifyError, applying } = this.state;
    const dish = this.selectedDish();
    const preview = dish ? this.verifyPreview() : null;
    const sortedDishes = this.sortedDishes();
    const dishIndex = this.currentDishIndex(sortedDishes);
    const canPrev = dishIndex > 0;
    const canNext =
      sortedDishes.length > 0 &&
      (dishIndex < 0 || dishIndex < sortedDishes.length - 1);

    return (
      <div className="settings migration-page">
        <h2 className="migration-page-title">
          {translate("settings.migration.title")}
        </h2>

        {!isLoggedIn ? (
          <p>{translate("settings.unauthenticated")}</p>
        ) : (
          <>
            <div className="migration-dish-nav">
              <button
                type="button"
                className="migrationBtn migration-dish-nav-btn"
                disabled={!canPrev}
                onClick={this.onPrevDish}
              >
                ← {translate("settings.migration.prev")}
              </button>
              <label className="migration-dish-select">
                <select value={selectedDishId} onChange={this.onSelectDish}>
                  <option value="">
                    {translate("settings.migration.selectPlaceholder")}
                  </option>
                  {sortedDishes.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="migrationBtn migration-dish-nav-btn"
                disabled={!canNext}
                onClick={this.onNextDish}
              >
                {translate("settings.migration.next")} →
              </button>
            </div>

            {verifyLoading && dish && (
              <p className="migration-verify-status">
                {translate("settings.migration.loadingVerify")}
              </p>
            )}

            {verifyError && (
              <p className="migration-verify-error">{verifyError}</p>
            )}

            {dish &&
              preview &&
              preview.reason === "no_verify_file" &&
              !verifyLoading && (
                <p>{translate("settings.migration.noVerifyFile")}</p>
              )}

            {dish &&
              preview &&
              preview.reason === "matches" &&
              !verifyLoading && (
                <p>{translate("settings.migration.matchesProduction")}</p>
              )}

            <SyncMigrationCompare
              left={{
                title: translate("settings.migration.current"),
                markdown: preview ? preview.currentMarkdown : "",
                empty: dish ? null : translate("settings.migration.pickDish"),
              }}
              right={{
                title: translate("settings.migration.verify"),
                markdown: preview ? preview.verifyMarkdown : "",
                empty: dish
                  ? verifyLoading
                    ? translate("settings.migration.loadingVerify")
                    : preview && preview.reason === "no_verify_file"
                    ? translate("settings.migration.noVerifyFile")
                    : null
                  : translate("settings.migration.pickDish"),
              }}
            />

            {dish && preview && preview.changed && !verifyLoading && (
              <div className="migration-page-actions">
                <p className="migration-apply-hint">
                  {translate("settings.migration.applyHint")}
                </p>
                <button
                  type="button"
                  className="migrationBtn migrationBtn--apply"
                  disabled={applying}
                  onClick={this.onApply}
                >
                  {translate("settings.migration.apply")}
                </button>
                <Link
                  to={{
                    pathname: `/dishes/edit/${dish.id}`,
                    query: { backUrl: MIGRATION_SETTINGS_PATH },
                  }}
                  className="migration-edit-link"
                >
                  {translate("settings.migration.openEditor")}
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}

DishMigrationPage.propTypes = {
  translate: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  dishes: PropTypes.arrayOf(PropTypes.object).isRequired,
  loadDishes: PropTypes.func.isRequired,
  applyMigration: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  translate: getTranslate(state.locale),
  isLoggedIn: !!state.user.email,
  dishes: state.dishes,
});

const mapDispatchToProps = {
  loadDishes: fetchDishes,
  applyMigration: editDish,
};

export default connect(mapStateToProps, mapDispatchToProps)(DishMigrationPage);
