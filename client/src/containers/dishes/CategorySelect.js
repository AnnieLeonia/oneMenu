import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import { find, get, sortBy } from "lodash/fp";

class CategorySelect extends Component {
  render() {
    const { categoryIds, categories, translate } = this.props;
    if (categories.length === 0) return null;

    return (
      <label htmlFor="categoryIds">
        <span>{translate("edit.category")}:</span>
        <select
          multiple
          id="categoryIds"
          name="categoryIds"
          defaultValue={categoryIds}
        >
          <option value="null">{translate("categories.uncategorized")}</option>
          {categories.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
    );
  }
}

CategorySelect.defaultProps = {
  categoryIds: [],
};

CategorySelect.propTypes = {
  categoryIds: PropTypes.arrayOf(PropTypes.number),
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  translate: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { id }) => ({
  categoryIds: get("categoryIds", find({ id }, state.dishes)),
  categories: sortBy("name", state.categories),
  translate: getTranslate(state.locale),
});

export default connect(mapStateToProps)(CategorySelect);
