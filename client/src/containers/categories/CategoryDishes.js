import React from "react";

import CategoryDishList from "./CategoryDishList";
import New from "../common/New";
import Snackbar from "../common/Snackbar";
import { addCategory } from "../../actions/categories";
import { searchInput } from "../../actions/search";

const CategoryDishes = (props) => (
  <div>
    <New
      view="categories"
      onAdd={addCategory}
      onSearch={searchInput}
      {...props}
    />
    <Snackbar />
    <CategoryDishList view="dishes" {...props} />
  </div>
);

export default CategoryDishes;
