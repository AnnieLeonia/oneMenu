// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import Icon from "vue-awesome/components/Icon";
import "vue-awesome/icons";

Vue.use(require("vue-moment"));
Vue.component("v-icon", Icon);
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  components: { App, "v-icon": Icon },
  template: "<App/>"
});
