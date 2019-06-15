import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

import Week from "./components/Week";
import Login from "./components/Login";
import EditDay from "./components/EditDay";

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/",
      component: Week
    },
    {
      path: "/login",
      component: Login
    },
    {
      path: "/edit/:date",
      component: EditDay
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.path !== "/login") {
    const name = Vue.cookie.get("name");
    if (name) {
      next();
    } else {
      next({ path: "/login" });
    }
  }
  next();
});

export default router;
