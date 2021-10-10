import { FETCH_DISHES } from "../constants/dishes";

const dishes = (state = [], action) => {
  switch (action.type) {
    case FETCH_DISHES:
      return action.dishes;
    default:
      return state;
  }
};

export default dishes;
