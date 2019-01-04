let clickOutside = {
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
  },
};

export default clickOutside;
