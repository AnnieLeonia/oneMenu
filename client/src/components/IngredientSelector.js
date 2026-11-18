import React, { Component } from "react";
import PropTypes from "prop-types";
const CATEGORY_ORDER = ["other"];

class IngredientSelector extends Component {
  constructor(props) {
    super(props);
    this.state = { search: "" };
  }

  onToggle(id) {
    const { selectedIds, onChange } = this.props;
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  onClear() {
    this.props.onChange([]);
  }

  filteredIngredients() {
    const { ingredients } = this.props;
    const q = this.state.search.trim().toLowerCase();
    if (!q) return ingredients;
    return ingredients.filter((ing) => ing.label.toLowerCase().includes(q));
  }

  groupedIngredients() {
    const filtered = this.filteredIngredients();
    const groups = {};
    CATEGORY_ORDER.forEach((key) => {
      groups[key] = [];
    });
    filtered.forEach((ing) => {
      const cat = groups[ing.category] ? ing.category : "other";
      groups[cat].push(ing);
    });
    return CATEGORY_ORDER.map((key) => ({
      key,
      items: groups[key] || [],
    })).filter((g) => g.items.length > 0);
  }

  render() {
    const { selectedIds, ingredients, translate } = this.props;
    const selected = ingredients.filter((ing) => selectedIds.includes(ing.id));
    const groups = this.groupedIngredients();

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
          />
        </div>

        {selected.length > 0 && (
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
            <div className="ingredient-chip-row">
              {selected.map((ing) => (
                <button
                  key={ing.id}
                  type="button"
                  className="ingredient-chip ingredient-chip--selected"
                  onClick={() => this.onToggle(ing.id)}
                >
                  {ing.label}
                  <span className="ingredient-chip-remove" aria-hidden="true">
                    ×
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {groups.length === 0 ? (
          <p className="find-empty">{translate("find.noIngredients")}</p>
        ) : (
          groups.map((group) => (
            <div key={group.key} className="ingredient-group">
              <h3 className="ingredient-group-title">
                {translate(`find.categories.${group.key}`)}
              </h3>
              <div className="ingredient-chip-row">
                {group.items.map((ing) => {
                  const isSelected = selectedIds.includes(ing.id);
                  return (
                    <button
                      key={ing.id}
                      type="button"
                      className={
                        isSelected
                          ? "ingredient-chip ingredient-chip--selected"
                          : "ingredient-chip"
                      }
                      onClick={() => this.onToggle(ing.id)}
                    >
                      {ing.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }
}

IngredientSelector.propTypes = {
  ingredients: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};

export default IngredientSelector;
