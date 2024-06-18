import { SEARCH_INPUT } from "../constants/search";

export const searchInput = (input) => async (dispatch) => {
  try {
    return dispatch({ type: SEARCH_INPUT, input });
  } catch (err) {
    console.error(err);
  }
};
