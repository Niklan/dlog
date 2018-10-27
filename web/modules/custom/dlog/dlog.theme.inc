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

    $variables['next']['entity'] = $next_entity;
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

    $variables['previous']['entity'] = $previous_entity;
    $variables['previous']['label'] = $previous_entity->label();
    $variables['previous']['url'] = $previous_entity->toUrl()->toString(TRUE)->getGeneratedUrl();
  }
}

/**
 * Implements template_preprocess_HOOK() for dlog-label-with-icon-media-formatter.html.twig.
 */
function template_preprocess_dlog_label_with_icon_media_formatter(array &$variables) {
  $mime_type = $variables['mime_type'];

  $mime_association = [
    'application/octet-stream' => 'application-octet-stream.svg',
    'application/zip' => 'application-zip.svg',
    'video/mp4' => 'video-mp4.svg',
    'image/jpeg' => 'image-jpeg.svg',
    'image/png' => 'image-png.svg',
    'video/x-wmv' => 'video-mp4.svg',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'application-vnd.ms-excel.addin.macroenabled.12.svg',
    'application/msword' => 'application-msword.svg',
    'application/pdf' => 'application-pdf.svg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'application-vnd.openxmlformats-officedocument.wordprocessingml.document.svg',
    'audio/x-mpeg' => 'audio-x-mpeg',
    'audio/x-wav' => 'audio-x-wav.svg',
    'text/csv' => 'text-csv.svg',
    'text/plain' => 'text-plain.svg',
  ];

  $icons_path = drupal_get_path('theme', 'blogger') . '/assets/images/mimetypes/';
  if (!array_key_exists($mime_type, $mime_association)) {
    $current_icon_filename = 'application-octet-stream.svg';
  }
  else {
    $current_icon_filename = $mime_association[$mime_type];
  }
  $variables['mime_icon_path'] = $icons_path . $current_icon_filename;
}
