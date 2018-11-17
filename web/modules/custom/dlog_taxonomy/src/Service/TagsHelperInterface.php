<?php

namespace Drupal\dlog_taxonomy\Service;

/**
 * Class with helpers for taxonomy vocabulary tags.
 *
 * @package Drupal\dlog_taxonomy\Service
 */
interface TagsHelperInterface {

  /**
   * Gets promo image uri from taxonomy term.
   *
   * @param int $tid
   *   The term id.
   *
   * @return string
   *   The file uri, NULL otherwise.
   */
  public function getPromoUri($tid);

}
