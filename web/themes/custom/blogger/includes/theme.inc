<?php

/**
 * @file
 * Custom theme hooks.
 */

use Drupal\node\NodeInterface;

/**
 * Implements hook_preprocess_HOOK() for dlog-previous-next--blog-article.html.twig.
 */
function blogger_preprocess_dlog_previous_next__blog_article(array &$variables) {
  /** @var \Drupal\node\NodeInterface $node */
  $next_entity = !empty($variables['next']) ? $variables['next']['entity'] : NULL;
  /** @var \Drupal\node\NodeInterface $node */
  $prev_entity = !empty($variables['previous']) ? $variables['previous']['entity'] : NULL;

  if ($next_entity) {
    /** @var \Drupal\media\MediaInterface $promo_media */
    $promo_media = $next_entity->get('field_image')->entity;
    $variables['next']['promo_uri'] = $promo_media->get('field_media_image')->entity->getFileUri();

    $tags = [];
    /** @var \Drupal\taxonomy\TermInterface $tag_term */
    foreach ($next_entity->get('field_tags')->referencedEntities() as $tag_term) {
      $tags[] = [
        'label' => $tag_term->label(),
      ];
    }
    $variables['next']['tags'] = $tags;
  }

  if ($prev_entity) {
    /** @var \Drupal\media\MediaInterface $promo_media */
    $promo_media = $prev_entity->get('field_image')->entity;
    $variables['previous']['promo_uri'] = $promo_media->get('field_media_image')->entity->getFileUri();

    $tags = [];
    /** @var \Drupal\taxonomy\TermInterface $tag_term */
    foreach ($prev_entity->get('field_tags')->referencedEntities() as $tag_term) {
      $tags[] = [
        'label' => $tag_term->label(),
      ];
    }
    $variables['previous']['tags'] = $tags;
  }
}

/**
 * Implements hook_preprocess_HOOK() for dlog-hero--dlog-node-blog-article.html.twig.
 */
function blogger_preprocess_dlog_hero__dlog_node_blog_article(array &$variables) {
  $tags = [];
  /** @var \Drupal\node\NodeInterface $node */
  $node = \Drupal::routeMatch()->getParameter('node');
  if ($node instanceof NodeInterface) {
    /** @var \Drupal\taxonomy\TermInterface $tag_term */
    foreach ($node->get('field_tags')->referencedEntities() as $tag_term) {
      $tags[] = [
        'label' => $tag_term->label(),
        'path' => $tag_term->toUrl()->toString(),
      ];
    }
  }
  $variables['tags'] = $tags;
}
