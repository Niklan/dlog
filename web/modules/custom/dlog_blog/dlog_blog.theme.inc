<?php

/**
 * @file
 * Main file for custom theme hook preprocess.
 */

use Drupal\node\NodeInterface;

/**
 * Implements hook_preprocess_HOOK() for dlog-blog-related-posts.html.twig.
 */
function template_preprocess_dlog_blog_related_posts(array &$variables) {
  $items = [];

  /** @var \Drupal\node\NodeInterface $node */
  $node = \Drupal::routeMatch()->getParameter('node');
  if ($node instanceof NodeInterface) {
    /** @var \Drupal\node\NodeStorageInterface $node_storage */
    $node_storage = \Drupal::entityTypeManager()->getStorage('node');
    /** @var \Drupal\node\NodeViewBuilder $node_view_builder */
    $node_view_builder = \Drupal::entityTypeManager()->getViewBuilder('node');
    /** @var \Drupal\dlog_blog\Service\BlogManagerInterface $blog_manager */
    $blog_manager = \Drupal::service('dlog_blog.manager');

    $related_post_ids = $blog_manager->getRelatedPosts($node, $variables['max'], $variables['max_exact_same_tags']);

    foreach ($related_post_ids as $id) {
      /** @var \Drupal\node\NodeInterface $related_post */
      $related_post = $node_storage->load($id);
      $items[] = $node_view_builder->view($related_post, 'teaser');
    }
  }

  $variables['items'] = $items;
}

/**
 * Implements hook_preprocess_HOOK() for dlog-blog-random-posts.html.twig.
 */
function template_preprocess_dlog_blog_random_posts(array &$variables) {
  $items = [];

  /** @var \Drupal\node\NodeInterface $node */
  $node = \Drupal::routeMatch()->getParameter('node');
  if ($node instanceof NodeInterface) {
    /** @var \Drupal\node\NodeStorageInterface $node_storage */
    $node_storage = \Drupal::entityTypeManager()->getStorage('node');
    /** @var \Drupal\node\NodeViewBuilder $node_view_builder */
    $node_view_builder = \Drupal::entityTypeManager()->getViewBuilder('node');
    /** @var \Drupal\dlog_blog\Service\BlogManagerInterface $blog_manager */
    $blog_manager = \Drupal::service('dlog_blog.manager');

    $random_post_ids = $blog_manager->getRandomPosts(4, [$node->id()]);

    foreach ($random_post_ids as $id) {
      /** @var \Drupal\node\NodeInterface $related_post */
      $related_post = $node_storage->load($id);
      $items[] = $node_view_builder->view($related_post, 'teaser');
    }
  }

  $variables['items'] = $items;
}
