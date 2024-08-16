import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import penselecticon from "../assets/icons/pen-select.svg";

const ListItem = ({
  id,
  value,
  checked,
  onClick,
  linkTo,
  backUrl,
  isLoggedIn,
}) => (
  <li className="listitem">
    <label role="presentation" onKeyDown={onClick} htmlFor={id}>
      <input
        readOnly
        id={id}
        type="checkbox"
        onClick={onClick}
        checked={checked}
      />
      <span className="dishText">{value}</span>
      <span className="checkmark" />
    </label>
    {isLoggedIn && (
      <Link to={{ pathname: linkTo, query: { backUrl } }} className="dishEdit">
        <img src={penselecticon} alt="Edit" height="27px" />
      </Link>
    )}
  </li>
);

ListItem.defaultProps = {
  checked: false,
  onClick: null,
  description: null,
  backUrl: null,
  isLoggedIn: false,
};

ListItem.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  value: PropTypes.string.isRequired,
  description: PropTypes.element,
  checked: PropTypes.bool,
  onClick: PropTypes.func,
  linkTo: PropTypes.string.isRequired,
  backUrl: PropTypes.string,
  isLoggedIn: PropTypes.bool,
};

export default ListItem;
