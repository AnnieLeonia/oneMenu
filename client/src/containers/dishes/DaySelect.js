import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";
import { find, get, sortBy } from "lodash/fp";

class DaySelect extends Component {
  render() {
    const { menuDayId, menuDays, translate } = this.props;
    if (menuDays.length === 0) return null;

    return (
      <label htmlFor="menuDayIds">
        <span>{translate("edit.day")}:</span>
        <select
          id="menuDayIds"
          name="menuDayIds"
          defaultValue={menuDayId || ""}
        >
          <option value="">{translate("menu.noDay")}</option>
          {menuDays.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
    );
  }
}

DaySelect.defaultProps = {
  menuDayId: null,
};

DaySelect.propTypes = {
  menuDayId: PropTypes.number,
  menuDays: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  translate: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { id }) => {
  const dish = find({ id }, state.dishes);
  const menuDayIds = get("menuDayIds", dish) || [];
  // Get the first menu day id (since only one is allowed)
  const menuDayId = menuDayIds.find((id) => id !== null) || null;

  return {
    menuDayId,
    menuDays: sortBy("orderidx", state.menuDays),
    translate: getTranslate(state.locale),
  };
};

export default connect(mapStateToProps)(DaySelect);
