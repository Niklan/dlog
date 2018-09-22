<?php

namespace Drupal\dlog_hero\Plugin\DlogHero\Path;

use Drupal\dlog_hero\Plugin\DlogHero\DlogHeroPluginBase;

/**
 * The base for DloGhero path plugin type.
 */
abstract class DlogHeroPathPluginBase extends DlogHeroPluginBase implements DlogHeroPathPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function getMatchPath() {
    return $this->pluginDefinition['match_path'];
  }

  /**
   * {@inheritdoc}
   */
  public function getMatchType() {
    return $this->pluginDefinition['match_type'];
  }

}
