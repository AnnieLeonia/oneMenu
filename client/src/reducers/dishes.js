import { FETCH_PRODUCTS } from '../constants/dishes';

const dishes = (state = [], action) => {
  switch (action.type) {
    case FETCH_PRODUCTS:
      return action.dishes;
    default:
      return state;
  }
};

export default dishes;
