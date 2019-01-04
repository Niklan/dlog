import Vue from 'vue';
import VueResource from 'vue-resource';
import VueWait from 'vue-wait';
import Store from './store';
// Plugins.
import Plugins from './plugins';
// Components.
import FrontpageGlobalSearch from './components/FrontpageGlobalSearch.vue';

Vue.use(VueResource);
Vue.use(VueWait);
Vue.use(Plugins);

new Vue({
  el: '#frontpage-global-search',
  render(h) {
    return h(FrontpageGlobalSearch);
  },
  store: Store,
  wait: new VueWait({
    useVuex: true,
  }),
});
