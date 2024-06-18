import React from "react";

import CategoryList from "./CategoryList";
import New from "../common/New";
import Snackbar from "../common/Snackbar";
import { addCategory } from "../../actions/categories";
import { searchInput } from "../../actions/search";

const Categories = (props) => (
  <div>
    <New
      view="categories"
      onAdd={addCategory}
      onSearch={searchInput}
      {...props}
    />
    <Snackbar />
    <CategoryList view="categories" {...props} />
  </div>
);

export default Categories;
