<?php

/**
 * @file
 * Theme and preprocess functions for breadcrumbs, messages, tabs..etc
 */

use Drupal\Core\Template\Attribute;

/**
 * Implements hook_preprocess_HOOK() for page.html.twig.
 */
function blogger_preprocess_page(array &$variables) {
  $main_layout_attributes = new Attribute();

  // Set default class.
  $main_layout_attributes->addClass('main-layout');

  // Handle sidebar modifiers.
  if (!empty($variables['page']['sidebar_first'])) {
    $main_layout_attributes->addClass('main-layout--sidebar-first');
  }
  else {
    $main_layout_attributes->addClass('main-layout--no-sidebars');
  }

  $variables['main_layout_attributes'] = $main_layout_attributes;
}
