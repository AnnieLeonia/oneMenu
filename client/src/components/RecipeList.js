import React from "react";
import PropTypes from "prop-types";

import DishItem from "./DishItem";

const di = (item, history, linkTo, backUrl) => (
  <DishItem
    id={item.id}
    key={item.id}
    value={item.value}
    img={item.img}
    onClick={() => history.push(`/dishes/${item.id}`)}
    linkTo={linkTo(item.id)}
    backUrl={backUrl}
  />
);

const RecipeList = ({ active, linkTo, backUrl, view, history }) => (
  <div className={view}>
    <div style={{ borderLeft: "5px solid #ccc" }}>
      <ul className="active">
        {active.map((item) => di(item, history, linkTo, backUrl))}
      </ul>
    </div>
  </div>
);

RecipeList.propTypes = {
  active: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      color: PropTypes.string,
      items: PropTypes.array,
    })
  ).isRequired,
  linkTo: PropTypes.func.isRequired,
  backUrl: PropTypes.string.isRequired,
  view: PropTypes.string.isRequired,
};

export default RecipeList;
