<?php

/**
 * @file
 * Preprocesses for paragraphs.
 */

/**
 * Implements hook_preprocess_HOOK() for paragraph-code.html.twig.
 */
function blogger_preprocess_paragraph__code(array &$variables) {
  $variables['#attached']['library'][] = 'blogger/paragraph.code';
}
