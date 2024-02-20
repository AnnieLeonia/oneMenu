import React from "react";
import PropTypes from "prop-types";
import onemenuicon from "../assets/icons/onemenu.svg";

const DishItem = ({ value, img, onClick }) => (
  <div className="dishItem" onClick={onClick}>
    <img src={img || onemenuicon} alt="Dish" className="dishImg"></img>
    <div className="dishImgText">{value}</div>
  </div>
);

DishItem.defaultProps = {
  img: "",
  onClick: null,
};

DishItem.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  value: PropTypes.string.isRequired,
  img: PropTypes.string,
  onClick: PropTypes.func,
};

export default DishItem;
