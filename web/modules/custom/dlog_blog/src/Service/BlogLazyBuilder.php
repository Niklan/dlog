<?php

namespace Drupal\dlog_blog\Service;

/**
 * Class for blog lazy builders.
 *
 * @package Drupal\dlog_blog\Serivce
 */
class BlogLazyBuilder implements BlogLazyBuilderInterface {

  /**
   * {@inheritdoc}
   */
  public static function randomBlogPosts() {
    return [
      '#theme' => 'dlog_blog_random_posts',
    ];
  }

}
