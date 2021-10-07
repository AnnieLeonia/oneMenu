import { combineReducers } from 'redux';
import { localeReducer } from 'react-localize-redux';

import dishes from './dishes';
import categories from './categories';
import user from './user';

export default combineReducers({
  locale: localeReducer,
  dishes,
  categories,
  user,
});
