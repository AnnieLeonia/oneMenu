import React from 'react';
import { Route } from 'react-router-dom';

import Header from './common/Header';
import DesiredList from './desirables';
import Categories from './categories';
import EditCategory from './categories/EditCategory';
import Dishes from './dishes';
import EditDish from './dishes/EditDish';
import Settings from './settings';
import SetLanguage from './settings/SetLanguage';
import FetchDB from './settings/FetchDB';

import '../styles/style.css';

const App = () => (
  <div>
    <Route path="/" component={Header} />
    <Route exact path="/" component={DesiredList} />
    <Route exact path="/categories" component={Categories} />
    <Route path="/categories/:id" component={EditCategory} />
    <Route exact path="/dishes" component={Dishes} />
    <Route path="/dishes/:id" component={EditDish} />
    <Route path="/settings" component={Settings} />
    <SetLanguage />
    <FetchDB />
  </div>
);

export default App;
