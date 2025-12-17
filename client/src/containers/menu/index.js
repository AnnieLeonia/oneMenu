import React from "react";

import MenuList from "./MenuList";
import Snackbar from "../common/Snackbar";

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

const Menu = (props) => {
  const now = new Date();
  const week = getWeekNumber(now);
  const year = getYear(now);

  return (
    <div>
      <Snackbar />
      <MenuList week={week} year={year} {...props} />
    </div>
  );
};

export default Menu;
