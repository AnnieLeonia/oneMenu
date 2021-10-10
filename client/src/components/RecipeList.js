import React from "react";
import PropTypes from "prop-types";

import ListItem from "./ListItem";

const li = (item, onItemClick, linkTo, backUrl) => (
  <ListItem
    id={item.id}
    key={item.id}
    value={item.value}
    checked={item.checked}
    onClick={() => onItemClick(item.id)}
    linkTo={linkTo(item.id)}
    backUrl={backUrl}
  />
);

const DishList = ({ active, onItemClick, linkTo, backUrl, view }) => (
  <div className={view}>
    <div style={{ borderLeft: "5px solid #ccc" }}>
      <ul className="active">
        {active.map((item) => li(item, onItemClick, linkTo, backUrl))}
      </ul>
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
