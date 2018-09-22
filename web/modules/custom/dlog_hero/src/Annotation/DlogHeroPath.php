<?php

namespace Drupal\dlog_hero\Annotation;

use Drupal\Component\Annotation\Plugin;

/**
 * DlogHeroPath annotation.
 *
 * @Annotation
 */
class DlogHeroPath extends Plugin {

  /**
   * The plugin ID.
   *
   * @var string
   */
  public $id;

  /**
   * The plugin status.
   *
   * By default all plugins are enabled and this value set in TRUE. You can set
   * it to FALSE, to temporary disable plugin.
   *
   * @var bool
   */
  public $enabled;

  /**
   * The paths to match.
   *
   * An array with paths to limit which plugin execution. Can contain wildcard
   * (*) and Drupal placeholders such as <front>.
   *
   * @var array
   */
  public $match_path;

  /**
   * The match type for match_path.
   *
   * Value can be:
   * - listed: (default) Shows only at paths from match_path.
   * - unlisted: Shows at all paths, excpet those listed in match_path.
   *
   * @var string
   */
  public $match_type;

  /**
   * The wight of plugin.
   *
   * Plugin with higher with, will be used.
   *
   * @var int
   */
  public $weight;

}
