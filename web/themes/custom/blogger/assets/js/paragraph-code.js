/**
 * @file
 * Paragraph code hilight behaviors.
 */

(function ($, Drupal) {

  Drupal.behaviors.paragraphCodeHighlight = {
    attach: function (context, settings) {
      const elements = $(context).find('pre code').once('highlight');

      if (elements.length) {
        $.each(elements, (key, element) => {
          hljs.highlightBlock(element);
        });
      }
    }
  };

})(jQuery, Drupal);
