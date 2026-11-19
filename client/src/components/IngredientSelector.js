import React, { useState } from "react";
import PropTypes from "prop-types";
import { isDefaultChip, sortCatalog } from "../utils/ingredients/catalog";
import { formatLabel } from "../utils/ingredients/normalize";
import {
  filterBySearch,
  isSearchChipId,
  makeSearchChipId,
  searchChipQuery,
} from "../utils/ingredients/search";

const chipButton = (ing, selected, onToggle) => (
  <button
    key={ing.id}
    type="button"
    className={`ingredient-chip${selected ? " ingredient-chip--selected" : ""}`}
    onClick={() => onToggle(ing.id)}
  >
    {ing.label}
  </button>
);

function IngredientSelector({ catalog, selectedIds, onChange, translate }) {
  const [search, setSearch] = useState("");

  const q = search.trim();
  const ingredients = sortCatalog(
    q ? filterBySearch(catalog, q) : catalog.filter(isDefaultChip)
  );

  const toggle = (id) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((s) => s !== id)
        : [...selectedIds, id]
    );
    setSearch("");
  };

  const commitSearch = () => {
    const id = makeSearchChipId(q);
    if (id && !selectedIds.includes(id)) onChange([...selectedIds, id]);
    setSearch("");
  };

  const selected = selectedIds
    .map((id) =>
      isSearchChipId(id)
        ? { id, label: formatLabel(searchChipQuery(id)) }
        : catalog.find((item) => item.id === id)
    )
    .filter(Boolean);

  return (
    <div className="ingredient-finder">
      <h2 className="find-title">{translate("find.title")}</h2>
      <p className="find-subtitle">{translate("find.subtitle")}</p>

      <input
        type="text"
        value={search}
        autoComplete="off"
        placeholder={translate("find.search")}
        onChange={({ target }) => setSearch(target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitSearch();
          }
        }}
      />

      {ingredients.length === 0 ? (
        <p className="find-empty">{translate("find.noIngredients")}</p>
      ) : (
        <div className="ingredient-chip-row ingredient-chip-row--clamped">
          {ingredients.map((ing) =>
            chipButton(ing, selectedIds.includes(ing.id), toggle)
          )}
        </div>
      )}

      {selected.length > 0 && (
        <div className="selected-ingredients">
          <div className="selected-ingredients-header">
            <span>{translate("find.selected")}</span>
            <button
              type="button"
              className="clear-all-btn"
              onClick={() => onChange([])}
            >
              {translate("find.clearAll")}
            </button>
          </div>
          <div className="ingredient-chip-row ingredient-chip-row--clamped">
            {selected.map((ing) => chipButton(ing, true, toggle))}
          </div>
        </div>
      )}
    </div>
  );
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
