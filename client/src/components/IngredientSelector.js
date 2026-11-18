import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  filterIngredientsByLooseSearch,
  formatFinderLabel,
  finderSearchSelectionQuery,
  isFinderChipVisibleByDefault,
  isFinderSearchSelectionId,
  makeFinderSearchSelectionId,
} from "../utils/recipeIngredients";

class IngredientSelector extends Component {
  constructor(props) {
    super(props);
    this.state = { search: "" };
  }

  sortChips(items) {
    return [...items].sort((a, b) => {
      if (a.recipeCount !== b.recipeCount) {
        return b.recipeCount - a.recipeCount;
      }
      return a.label.localeCompare(b.label, "sv", { sensitivity: "base" });
    });
  }

  visibleIngredients() {
    const { catalog } = this.props;
    const q = this.state.search.trim().toLowerCase();
    if (q) {
      return this.sortChips(filterIngredientsByLooseSearch(catalog, q));
    }
    return this.sortChips(
      catalog.filter((ing) => isFinderChipVisibleByDefault(ing))
    );
  }

  onToggleIngredient(id) {
    const { selectedIds, onChange } = this.props;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
    this.setState({ search: "" });
  }

  onClear() {
    this.props.onChange([]);
  }

  commitSearch() {
    const q = this.state.search.trim();
    if (!q) return;
    const id = makeFinderSearchSelectionId(q);
    if (!id) return;
    const { selectedIds, onChange } = this.props;
    if (!selectedIds.includes(id)) {
      onChange([...selectedIds, id]);
    }
    this.setState({ search: "" });
  }

  selectedChips() {
    const { catalog, selectedIds } = this.props;
    return selectedIds
      .map((id) => {
        if (isFinderSearchSelectionId(id)) {
          return {
            id,
            label: formatFinderLabel(finderSearchSelectionQuery(id)),
            isSearchQuery: true,
          };
        }
        const ing = catalog.find((item) => item.id === id);
        return ing || null;
      })
      .filter(Boolean);
  }

  renderChip(ing, isSelected, onClick) {
    return (
      <button
        key={ing.id}
        type="button"
        className={
          isSelected
            ? "ingredient-chip ingredient-chip--selected"
            : "ingredient-chip"
        }
        onClick={onClick}
      >
        {ing.label}
      </button>
    );
  }

  render() {
    const { selectedIds, translate } = this.props;
    const ingredients = this.visibleIngredients();
    const selected = this.selectedChips();
    const hasSelection = selected.length > 0;

    return (
      <div className="ingredient-finder">
        <h2 className="find-title">{translate("find.title")}</h2>
        <p className="find-subtitle">{translate("find.subtitle")}</p>

        <div className="find-search">
          <input
            type="text"
            value={this.state.search}
            autoComplete="off"
            placeholder={translate("find.search")}
            onChange={({ target }) => this.setState({ search: target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                this.commitSearch();
              }
            }}
          />
        </div>

        {ingredients.length === 0 ? (
          <p className="find-empty">{translate("find.noIngredients")}</p>
        ) : (
          <div className="ingredient-chip-row ingredient-chip-row--clamped">
            {ingredients.map((ing) =>
              this.renderChip(ing, selectedIds.includes(ing.id), () =>
                this.onToggleIngredient(ing.id)
              )
            )}
          </div>
        )}

        {hasSelection && (
          <div className="selected-ingredients">
            <div className="selected-ingredients-header">
              <span>{translate("find.selected")}</span>
              <button
                type="button"
                className="clear-all-btn"
                onClick={() => this.onClear()}
              >
                {translate("find.clearAll")}
              </button>
            </div>
            <div className="ingredient-chip-row ingredient-chip-row--clamped">
              {selected.map((ing) =>
                this.renderChip(ing, true, () =>
                  this.onToggleIngredient(ing.id)
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

IngredientSelector.propTypes = {
  catalog: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      recipeCount: PropTypes.number,
    })
  ).isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};

export default IngredientSelector;
