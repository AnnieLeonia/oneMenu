import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import penselecticon from "../assets/icons/pen-select.svg";
import onemenuicon from "../assets/icons/onemenu.svg";

const DishItem = ({ value, img, onClick, linkTo, backUrl }) => (
  <li className="listitem">
    <span onClick={onClick}>
      <img src={img || onemenuicon} alt="Dish" className="dishImg"></img>
      <span className="dishText small">{value}</span>
    </span>
    <Link to={{ pathname: linkTo, query: { backUrl } }} className="dishEdit">
      <img src={penselecticon} alt="Edit" height="27px" />
    </Link>
  </li>
);

DishItem.defaultProps = {
  img: "",
  onClick: null,
  backUrl: null,
};

DishItem.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  value: PropTypes.string.isRequired,
  img: PropTypes.string,
  onClick: PropTypes.func,
  linkTo: PropTypes.string.isRequired,
  backUrl: PropTypes.string,
};

export default DishItem;
