import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

import Week from "./components/Week";
import EditDay from "./components/EditDay";

export default new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      component: Week
    },
    {
      path: "/edit/:date",
      component: EditDay
    }
  ]
});
