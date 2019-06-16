import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const Store = new Vuex.Store({
  state: {
    currentDinner: {}
  },
  mutations: {
    setCurrentDinner(state, newDinner) {
      state.currentDinner = newDinner;
    }
  }
});

export default Store;
