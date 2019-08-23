import Vue from "vue";
import VueRouter from "vue-router";

import Week from "./components/Week";
import EditDay from "./components/EditDay";

Vue.use(VueRouter);

const router = new VueRouter({
  mode: "history",
  routes: [{
      path: "/",
      component: Week
    },
    {
      path: "/edit/:date",
      component: EditDay
    }
  ]
});

export default router;