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

/**
 * Implements hook_preprocess_HOOK() for page--front.html.twig.
 */
function blogger_preprocess_page__front(array &$variables) {
  /** @var \Drupal\media\MediaStorage $media_storage */
  $media_storage = \Drupal::entityTypeManager()->getStorage('media');
  /** @var \Drupal\media\MediaInterface $media_image */
  $media_image = $media_storage->load(36);
  /** @var \Drupal\media\MediaInterface $media_video */
  $media_video = $media_storage->load(37);

  $variables['search_image_uri'] = $media_image->get('field_media_image')
    ->entity
    ->getFileUri();

  $variables['search_video_uri'] = $media_video->get('field_media_video_file')
    ->entity
    ->getFileUri();

  // Author media.
  /** @var \Drupal\media\MediaInterface $media_video */
  $author_avatar = $media_storage->load(38);

  $variables['author_avatar'] = $author_avatar->get('field_media_image')
    ->entity
    ->getFileUri();

  /** @var \Drupal\media\MediaInterface $media_video */
  $author_bg = $media_storage->load(39);

  $variables['author_bg'] = $author_bg->get('field_media_image')
    ->entity
    ->getFileUri();
}

/**
 * Implements hook_preprocess_HOOK() for page--contact.html.twig.
 */
function blogger_preprocess_page__contact(array &$variables) {
  /** @var \Drupal\media\MediaStorage $media_storage */
  $media_storage = \Drupal::entityTypeManager()->getStorage('media');
  /** @var \Drupal\media\MediaInterface $media_image */
  $media_image = $media_storage->load(40);
  /** @var \Drupal\media\MediaInterface $media_video */
  $media_video = $media_storage->load(41);

  $variables['contact_image_uri'] = $media_image->get('field_media_image')
    ->entity
    ->getFileUri();

  $variables['contact_video_uri'] = $media_video->get('field_media_video_file')
    ->entity
    ->getFileUri();
}
