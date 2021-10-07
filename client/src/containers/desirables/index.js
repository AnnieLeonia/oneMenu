import React from 'react';

import DesiredList from './DesiredList';
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
    <DesiredList view="dishes" />
  </div>
);

export default Dishes;
