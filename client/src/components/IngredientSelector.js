import React, { Component } from "react";
import PropTypes from "prop-types";
import { isDefaultChip, sortCatalog } from "../utils/ingredients/catalog";
import { formatLabel } from "../utils/ingredients/normalize";
import {
  filterBySearch,
  isSearchChipId,
  makeSearchChipId,
  searchChipQuery,
} from "../utils/ingredients/search";

class IngredientSelector extends Component {
  constructor(props) {
    super(props);
    this.state = { search: "" };
  }

  visibleIngredients() {
    const { catalog } = this.props;
    const q = this.state.search.trim();
    const items = q
      ? filterBySearch(catalog, q)
      : catalog.filter(isDefaultChip);
    return sortCatalog(items);
  }

  onToggleIngredient(id) {
    const { selectedIds, onChange } = this.props;
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id]
    );
    this.setState({ search: "" });
  }

  onClear() {
    this.props.onChange([]);
  }

  commitSearch() {
    const q = this.state.search.trim();
    if (!q) return;
    const id = makeSearchChipId(q);
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
        if (isSearchChipId(id)) {
          return {
            id,
            label: formatLabel(searchChipQuery(id)),
            isSearchQuery: true,
          };
        }
        const ing = catalog.find((item) => item.id === id);
        return ing || null;
      })
      .filter(Boolean);
  }

  renderChip(ing, selected) {
    return (
      <button
        key={ing.id}
        type="button"
        className={
          selected
            ? "ingredient-chip ingredient-chip--selected"
            : "ingredient-chip"
        }
        onClick={() => this.onToggleIngredient(ing.id)}
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

        {ingredients.length === 0 ? (
          <p className="find-empty">{translate("find.noIngredients")}</p>
        ) : (
          <div className="ingredient-chip-row ingredient-chip-row--clamped">
            {ingredients.map((ing) =>
              this.renderChip(ing, selectedIds.includes(ing.id))
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
              {selected.map((ing) => this.renderChip(ing, true))}
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
