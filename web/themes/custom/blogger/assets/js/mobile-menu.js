/**
 * @file
 * Mobile menu behaviors.
 */

(function(Drupal) {

  Drupal.behaviors.dlogMobileMenu = {
    attach: function(context, settings) {
      let toggler = context.querySelector('.mobile-menu-toggle:not(.menu-toggle--processed)');
      let mobileMenu = context.querySelector('.header-mobile__content');

      if (toggler && mobileMenu) {
        toggler.addEventListener('click', e => {
          this.toggle(e, mobileMenu);
        });
        toggler.classList.add('menu-toggle--processed');
      }
    },

    toggle: function(event, mobileMenu) {
      event.target.classList.toggle('header-mobile__menu-button--active');
      mobileMenu.classList.toggle('header-mobile__content--active');
    },
  };

})(Drupal);
