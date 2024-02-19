import { combineReducers } from "redux";
import { localeReducer } from "react-localize-redux";

import dish from "./dish";
import dishes from "./dishes";
import categories from "./categories";
import search from "./search";
import user from "./user";

export default combineReducers({
  locale: localeReducer,
  dish,
  dishes,
  categories,
  search,
  user,
});
