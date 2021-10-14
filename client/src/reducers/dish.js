import { FETCH_DISH } from "../constants/dishes";

const dish = (state = {}, action) => {
  switch (action.type) {
    case FETCH_DISH:
      return action.dish;
    default:
      return state;
  }
};

export default dish;
