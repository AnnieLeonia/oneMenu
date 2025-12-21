import { FETCH_DISH, RESET_DISH } from "../constants/dishes";

const dish = (state = {}, action) => {
  switch (action.type) {
    case FETCH_DISH:
      return action.dish;
    case RESET_DISH:
      return {};
    default:
      return state;
  }
};

export default dish;
