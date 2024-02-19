import { SEARCH_INPUT } from "../constants/dishes";

const search = (state = "", action) => {
  switch (action.type) {
    case SEARCH_INPUT:
      return action.input;
    default:
      return state;
  }
};

export default search;
