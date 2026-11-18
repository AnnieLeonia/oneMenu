import { combineReducers } from "redux";
import { localizeReducer } from "react-localize-redux";

import dish from "./dish";
import dishes from "./dishes";
import categories from "./categories";
import menuDays from "./menu-days";
import search from "./search";
import user from "./user";

export default combineReducers({
  locale: localizeReducer,
  dish,
  dishes,
  categories,
  menuDays,
  search,
  user,
});
