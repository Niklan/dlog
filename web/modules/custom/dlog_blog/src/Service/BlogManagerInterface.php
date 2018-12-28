<?php

namespace Drupal\dlog_blog\Service;

use Drupal\node\NodeInterface;

/**
 * Simple helpers for blog articles.
 *
 * @package Drupal\dlog_blog\Service
 */
interface BlogManagerInterface {

  /**
   * Gets related blog posts with exact same tags.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The node object for which search related posts.
   * @param int $limit
   *   The max limit of related posts.
   *
   * @return array
   *   The related blog posts entity id's.
   */
  public function getRelatedPostsWithExactSameTags(NodeInterface $node, $limit = 2);

  /**
   * Gets related blog posts with same tags (one of them must exists).
   *
   * @param \Drupal\node\NodeInterface $node
   *   The node object for which search related posts.
   * @param array $exclude_ids
   *   The array with node id's which must be excluded.
   * @param int $limit
   *   The max limit of related posts.
   *
   * @return array
   *   The related blog posts entity id's.
   */
  public function getRelatedPostsWithSameTags(NodeInterface $node, array $exclude_ids = [], $limit = 2);

  /**
   * Gets random blog posts.
   *
   * @param int $limit
   *   The max limit of related posts.
   * @param array $exclude_ids
   *   The array with node id's which must be excluded.
   *
   * @return array
   *   The related blog posts entity id's.
   */
  public function getRandomPosts($limit = 2, array $exclude_ids = []);

  /**
   * Gets related posts.
   *
   * @param \Drupal\node\NodeInterface $node
   *   The node for which related posts is looking for.
   * @param int $max
   *   The max related post trying to find.
   * @param int $exact_tags
   *   The max related posts trying to find with exact same tags.
   *
   * @return array
   *   The related blog posts entity id's.
   */
  public function getRelatedPosts(NodeInterface $node, $max = 4, $exact_tags = 2);

}
