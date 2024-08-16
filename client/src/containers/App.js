import React from "react";
import { Route } from "react-router-dom";

import Header from "./common/Header";
import NotFound from "./common/NotFound";
import Forbidden from "./common/Forbidden";
import Categories from "./categories";
import CategoryDishes from "./categories/CategoryDishes";
import EditCategory from "./categories/EditCategory";
import Dishes from "./dishes";
import ShowDish from "./dishes/ShowDish";
import EditDish from "./dishes/EditDish";
import Settings from "./settings";
import SetLanguage from "./settings/SetLanguage";
import FetchDB from "./settings/FetchDB";

import "../styles/style.css";
import "../styles/markdown.css";

const App = () => (
  <div>
    <Route path="/" component={Header} />
    <Route exact path="/" component={Dishes} />
    <Route exact path="/categories" component={Categories} />
    <Route exact path="/categories/:id" component={CategoryDishes} />
    <Route exact path="/categories/edit/:id" component={EditCategory} />
    <Route exact path="/dishes/:id" component={ShowDish} />
    <Route exact path="/dishes/edit/:id" component={EditDish} />
    <Route exact path="/settings" component={Settings} />
    <Route exact path="/not-found" render={NotFound} />
    <Route exact path="/forbidden" render={Forbidden} />
    <SetLanguage />
    <FetchDB />
  </div>
);

export default App;
