import React from "react";

import DesiredList from "./DesiredList";
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
    <DesiredList view="dishes" {...props} />
  </div>
);

export default Dishes;
