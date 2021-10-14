import React from "react";

import DesiredList from "./DesiredList";
import New from "../common/New";
import Snackbar from "../common/Snackbar";
import { addDish, toggleDishInactive, removeDish } from "../../actions/dishes";

const Dishes = (props) => (
  <div>
    <New
      view="dishes"
      autosuggest
      onAdd={addDish}
      onSelect={toggleDishInactive}
      onRemove={removeDish}
      {...props}
    />
    <Snackbar />
    <DesiredList view="dishes" {...props} />
  </div>
);

export default Dishes;
