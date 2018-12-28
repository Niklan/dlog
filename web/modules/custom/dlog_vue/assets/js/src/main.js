import Vue from 'vue';
import VueResource from 'vue-resource';
import VueWait from 'vue-wait';
import Store from './store';
// Components.
import FrontpageGlobalSearch from './components/FrontpageGlobalSearch.vue';

Vue.use(VueResource);
Vue.use(VueWait);

Vue.directive('click-outside', {
  bind: function(el, binding, vnode) {
    binding.event = function(event) {
      if (!(el == event.target || el.contains(event.target))) {
        vnode.context[binding.expression](event);
      }
    };
    document.body.addEventListener('click', binding.event);
  },
  unbind: function(el, binding) {
    document.body.removeEventListener('click', binding.event);
  }
});

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
