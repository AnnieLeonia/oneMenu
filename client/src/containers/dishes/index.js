import React from 'react';

import DishList from './DishList';
import New from '../common/New';
import Snackbar from '../common/Snackbar';
import { addDish, removeDish } from '../../actions/dishes';

const Dishes = () => (
  <div>
    <New
      view="dishes"
      autosuggest
      onAdd={addDish}
      onRemove={removeDish}
    />
    <Snackbar />
    <DishList view="dishes" />
  </div>
);

export default Dishes;
