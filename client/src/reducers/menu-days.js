import { FETCH_MENU_DAYS } from "../constants/menu-days";

const menuDays = (state = [], action) => {
  switch (action.type) {
    case FETCH_MENU_DAYS:
      return action.menuDays;
    default:
      return state;
  }
};

export default menuDays;
