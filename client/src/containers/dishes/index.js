import React from "react";

import DishList from "./DishList";
import New from "../common/New";
import Snackbar from "../common/Snackbar";
import {
  addDish,
  toggleDishInactive,
  removeDish,
  searchInput,
} from "../../actions/dishes";

const Dishes = (props) => (
  <div>
    <New
      view="dishes"
      onAdd={addDish}
      onSelect={toggleDishInactive}
      onRemove={removeDish}
      onSubmit={(dish) => props.history.push(`/dishes/${dish.id}`)}
      onSearch={searchInput}
      {...props}
    />
    <Snackbar />
    <DishList {...props} />
  </div>
);

export default Dishes;
