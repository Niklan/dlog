/**
 * @file
 * Paragraph code higlight behaviors.
 */

(function (Drupal) {

  Drupal.behaviors.paragraphCodeHighlight = {
    attach: function (context, settings) {
      const elements = context.querySelectorAll('pre code');

      if (elements.length) {
        elements.forEach(element => {
          hljs.highlightBlock(element);
        });
      }
    },
  };

})(Drupal);
