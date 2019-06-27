import Vue from 'vue';
import VueCookie from 'vue-cookie';
import ElementUI from 'element-ui';
import VueAsyncComputed from 'vue-async-computed';
import Icon from 'vue-awesome/components/Icon';
import 'element-ui/lib/theme-chalk/index.css';
import 'vue-awesome/icons';

import App from './App';
import Routes from './routes';
import Store from './store';
import './registerServiceWorker';

Vue.use(VueCookie);
Vue.use(ElementUI);
Vue.use(VueAsyncComputed);
Vue.use(require('vue-moment'));

Vue.component('v-icon', Icon);

Vue.config.productionTip = false;

new Vue({
  el: '#app',
  router: Routes,
  store: Store,
  components: { App, 'v-icon': Icon },
  template: '<App/>',
});
