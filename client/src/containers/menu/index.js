import React from "react";

import MenuList from "./MenuList";
import Snackbar from "../common/Snackbar";

const Menu = (props) => (
  <div>
    <Snackbar />
    <MenuList {...props} />
  </div>
);

export default Menu;
