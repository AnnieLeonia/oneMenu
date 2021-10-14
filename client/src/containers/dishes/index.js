import React from "react";

import DishList from "./DishList";
import New from "../common/New";
import Snackbar from "../common/Snackbar";
import { toggleDishInactive, removeDish } from "../../actions/dishes";

const Dishes = (props) => (
  <div>
    <New
      view="dishes"
      autosuggest
      onAdd={(dish) => toggleDishInactive(dish.id)}
      onRemove={removeDish}
      {...props}
    />
    <Snackbar />
    <DishList view="dishes" {...props} />
  </div>
);

export default Dishes;
