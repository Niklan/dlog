<?php

/**
 * @file
 * Theme and preprocess functions for breadcrumbs, messages, tabs..etc
 */

use Drupal\Core\Template\Attribute;
use Drupal\media\MediaInterface;
use Drupal\node\NodeInterface;

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
  if ($media_image instanceof MediaInterface) {
    $variables['search_image_uri'] = $media_image->get('field_media_image')
      ->entity
      ->getFileUri();
  }

  /** @var \Drupal\media\MediaInterface $media_video */
  $media_video = $media_storage->load(37);
  if ($media_video instanceof MediaInterface) {
    $variables['search_video_uri'] = $media_video->get('field_media_video_file')
      ->entity
      ->getFileUri();
  }

  // Author media.
  /** @var \Drupal\media\MediaInterface $media_video */
  $author_avatar = $media_storage->load(38);
  if ($author_avatar instanceof MediaInterface) {
    $variables['author_avatar'] = $author_avatar->get('field_media_image')
      ->entity
      ->getFileUri();
  }

  /** @var \Drupal\media\MediaInterface $media_video */
  $author_bg = $media_storage->load(39);
  if ($author_bg instanceof MediaInterface) {
    $variables['author_bg'] = $author_bg->get('field_media_image')
      ->entity
      ->getFileUri();
  }
}

/**
 * Implements hook_preprocess_HOOK() for page--contact.html.twig.
 */
function blogger_preprocess_page__contact(array &$variables) {
  /** @var \Drupal\media\MediaStorage $media_storage */
  $media_storage = \Drupal::entityTypeManager()->getStorage('media');

  /** @var \Drupal\media\MediaInterface $media_image */
  $media_image = $media_storage->load(40);
  if ($media_image instanceof MediaInterface) {
    $variables['contact_image_uri'] = $media_image->get('field_media_image')
      ->entity
      ->getFileUri();
  }

  /** @var \Drupal\media\MediaInterface $media_video */
  $media_video = $media_storage->load(41);
  if ($media_video instanceof MediaInterface) {
    $variables['contact_video_uri'] = $media_video->get('field_media_video_file')
      ->entity
      ->getFileUri();
  }
}

/**
 * Implements hook_theme_suggestions_HOOK_alter() for page.html.twig.
 */
function blogger_theme_suggestions_page_alter(array &$suggestions, array $variables) {
  $node = \Drupal::routeMatch()->getParameter('node');
  if ($node instanceof NodeInterface) {
    if ($node->id() == 1) {
      $suggestions[] = 'page__about';
    }
  }
}

/**
 * Implements hook_preprocess_HOOK() for page--about.html.twig.
 */
function blogger_preprocess_page__about(array &$variables) {
  /** @var \Drupal\media\MediaStorage $media_storage */
  $media_storage = \Drupal::entityTypeManager()->getStorage('media');

  /** @var \Drupal\media\MediaInterface $media_image */
  $media_image = $media_storage->load(42);
  if ($media_image instanceof MediaInterface) {
    $variables['about_image_uri'] = $media_image->get('field_media_image')
      ->entity
      ->getFileUri();
  }

  $media_image = $media_storage->load(43);
  if ($media_image instanceof MediaInterface) {
    $variables['about_signature_uri'] = $media_image->get('field_media_image')
      ->entity
      ->getFileUri();
  }
}
