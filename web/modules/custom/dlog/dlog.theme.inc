<?php

/**
 * @file
 * Main file for preprocessing custom theme hooks.
 */

/**
 * Implements template_preprocess_HOOK() for dlog-previous-next.html.twig.
 */
function template_preprocess_dlog_previous_next(&$variables) {
  /** @var \Drupal\Core\Entity\EntityInterface $entity */
  $entity = $variables['entity'];
  $variables['next'] = [];
  $variables['previous'] = [];

  /** @var \Drupal\Core\Entity\EntityStorageInterface $entity_storage */
  $entity_storage = \Drupal::entityTypeManager()
    ->getStorage($entity->getEntityTypeId());

  // Getting next entity ID.
  $next_entity_id = $entity_storage->getQuery()
    ->condition('type', $entity->bundle())
    ->condition('created', $entity->getCreatedTime(), '>')
    ->range(0, 1)
    ->sort('created', 'ASC')
    ->execute();

  if (!empty($next_entity_id)) {
    $next_entity = $entity_storage->load(array_shift($next_entity_id));

    $variables['next']['label'] = $next_entity->label();
    $variables['next']['url'] = $next_entity->toUrl()->toString(TRUE)->getGeneratedUrl();
  }

  // Getting previous entity ID.
  $previous_entity_id = $entity_storage->getQuery()
    ->condition('type', $entity->bundle())
    ->condition('created', $entity->getCreatedTime(), '<')
    ->range(0, 1)
    ->sort('created', 'DESC')
    ->execute();

  if (!empty($previous_entity_id)) {
    $previous_entity = $entity_storage->load(array_shift($previous_entity_id));

    $variables['previous']['label'] = $previous_entity->label();
    $variables['previous']['url'] = $previous_entity->toUrl()->toString(TRUE)->getGeneratedUrl();
  }
}
