import React from "react";
import PropTypes from "prop-types";

import DishItem from "./DishItem";

const di = (item, history, backUrl) => (
  <DishItem
    id={item.id}
    key={item.id}
    value={item.value}
    img={item.img}
    onClick={() =>
      history.push({ pathname: `/dishes/${item.id}`, query: { backUrl } })
    }
  />
);

const DishList = ({ items, backUrl, history }) => (
  <div>
    {items.map(({ value, color, items }) => (
      <div key={value} style={{ borderLeft: `5px solid ${color || "#ccc"}` }}>
        <div className="section">{value}</div>
        <div className="grid">
          {items.map((item) => di(item, history, backUrl))}
        </div>
      </div>
    ))}
  </div>
);

DishList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      color: PropTypes.string,
      items: PropTypes.array,
    })
  ).isRequired,
  onItemClick: PropTypes.func.isRequired,
  linkTo: PropTypes.func.isRequired,
  backUrl: PropTypes.string.isRequired,
};

export default DishList;
