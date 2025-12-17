import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getTranslate } from "react-localize-redux";

import MenuList from "./MenuList";
import Snackbar from "../common/Snackbar";

// Get ISO week number
const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

const getYear = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  return d.getFullYear();
};

class Menu extends Component {
  constructor(props) {
    super(props);
    const now = new Date();
    this.state = {
      week: getWeekNumber(now),
      year: getYear(now),
      showAll: true,
    };
  }

  changeWeek = (delta) => {
    let { week, year } = this.state;
    week += delta;

    // Handle year boundaries
    if (week < 1) {
      year -= 1;
      week = 52;
    } else if (week > 52) {
      year += 1;
      week = 1;
    }

    this.setState({ week, year });
  };

  goToCurrentWeek = () => {
    const now = new Date();
    this.setState({
      week: getWeekNumber(now),
      year: getYear(now),
    });
  };

  toggleShowAll = () => {
    this.setState((state) => ({ showAll: !state.showAll }));
  };

  render() {
    const { translate, ...props } = this.props;
    const { week, year, showAll } = this.state;

    return (
      <div>
        <Snackbar />
        {!showAll && (
          <>
            <div className="week-navigation">
              <button type="button" onClick={() => this.changeWeek(-1)}>
                ◀ {translate("menu.prevWeek")}
              </button>
              <span className="week-display">
                {translate("menu.week")} {week}, {year}
              </span>
              <button type="button" onClick={() => this.changeWeek(1)}>
                {translate("menu.nextWeek")} ▶
              </button>
            </div>
            <button
              type="button"
              className="current-week-btn"
              onClick={this.goToCurrentWeek}
            >
              {translate("menu.currentWeek")}
            </button>
          </>
        )}
        <button
          type="button"
          className={`show-all-btn ${showAll ? "active" : ""}`}
          onClick={this.toggleShowAll}
        >
          {showAll ? translate("menu.showWeek") : translate("menu.showAll")}
        </button>
        <MenuList
          week={week}
          year={year}
          showAll={showAll}
          translate={translate}
          {...props}
        />
      </div>
    );
  }
}

Menu.propTypes = {
  translate: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  translate: getTranslate(state.locale),
});

export default connect(mapStateToProps)(Menu);
