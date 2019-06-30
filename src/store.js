import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const Store = new Vuex.Store({
  state: {
    editable: false,
    currentWeek: '',
  },
  mutations: {
    setEditable(state, boolean) {
      state.editable = boolean;
    },
    setWeek(state, week) {
      if (state.currentWeek == '') {
        state.currentWeek = week;
      }
    },
    backWeek(state, moment) {
      state.currentWeek = moment.subtract(7, 'days');
    },
    nextWeek(state, moment) {
      state.currentWeek = moment.add(7, 'days');
    },
  },
});

export default Store;
