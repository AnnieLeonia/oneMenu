// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import VueRouter from "vue-router";
import Routes from "./routes";
import Icon from "vue-awesome/components/Icon";
import asyncComputed from "vue-async-computed";
import "vue-awesome/icons";

Vue.use(require("vue-moment"));
Vue.use(asyncComputed);
Vue.component("v-icon", Icon);
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  router: Routes,
  components: { App, "v-icon": Icon },
  template: "<App/>"
});
