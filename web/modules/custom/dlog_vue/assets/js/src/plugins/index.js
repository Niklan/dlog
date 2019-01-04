import ClickOutside from './click-outside';

export default {
  install(Vue) {
    Vue.directive('click-outside', ClickOutside);
  },
};
