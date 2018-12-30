<?php

/**
 * @file
 * Theme and preprocess functions for nodes
 */

/**
 * Implements hook_preprocess_HOOK() for node.html.twig.
 */
function blogger_preprocess_node(array &$variables) {
  /** @var \Drupal\node\NodeInterface $node */
  $node = $variables['node'];
  $variables['url_absolute'] = $node->toUrl('canonical', ['absolute' => TRUE])
    ->toString(TRUE)
    ->getGeneratedUrl();
}
