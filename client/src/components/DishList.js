import React from "react";
import PropTypes from "prop-types";

import ListItem from "./ListItem";

const li = (item, onItemClick, linkTo, backUrl) => (
  <ListItem
    id={item.key}
    key={item.key}
    value={item.value}
    checked={item.checked}
    onClick={() => onItemClick(item.id)}
    linkTo={linkTo(item.id)}
    backUrl={backUrl}
  />
);

const DishList = ({ active, onItemClick, linkTo, backUrl, view }) => (
  <div className={view}>
    <div>
      {active.map(({ value, color, items }) => (
        <div key={value} style={{ borderLeft: `5px solid ${color || "#ccc"}` }}>
          <div className="section">{value}</div>
          <ul className="active">
            {items.map((item) => li(item, onItemClick, linkTo, backUrl))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

DishList.propTypes = {
  active: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      color: PropTypes.string,
      items: PropTypes.array,
    })
  ).isRequired,
  onItemClick: PropTypes.func.isRequired,
  linkTo: PropTypes.func.isRequired,
  backUrl: PropTypes.string.isRequired,
  view: PropTypes.string.isRequired,
};

export default DishList;
