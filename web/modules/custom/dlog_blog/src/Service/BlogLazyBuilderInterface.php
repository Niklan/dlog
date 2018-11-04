<?php

namespace Drupal\dlog_blog\Service;

/**
 * Class for blog lazy builders.
 *
 * @package Drupal\dlog_blog\Serivce
 */
interface BlogLazyBuilderInterface {

  /**
   * Gets random posts with theme hook dlog_blog_random_posts.
   *
   * @return array
   *   Render array with theme hook.
   */
  public static function randomBlogPosts();

}
