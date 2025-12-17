import { FETCH_MENU_DAYS } from "../constants/menu-days";

export const fetchMenuDays = () => async (dispatch) => {
  try {
    const res = await fetch("/__/menu-days", { credentials: "include" });
    const menuDays = await res.json();
    return dispatch({ type: FETCH_MENU_DAYS, menuDays });
  } catch (err) {
    console.error(err);
  }
};
