<?php

namespace Drupal\dlog_hero\Plugin\DlogHero\Entity;

use Drupal\dlog_hero\Plugin\DlogHero\DlogHeroPluginBase;

/**
 * The base for DlogHero entity plugin type.
 */
abstract class DlogHeroEntityPluginBase extends DlogHeroPluginBase implements DlogHeroEntityPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function getEntityType() {
    return $this->pluginDefinition['entity_type'];
  }

  /**
   * {@inheritdoc}
   */
  public function getEntityBundle() {
    return $this->pluginDefinition['entity_bundle'];
  }

  /**
   * {@inheritdoc}
   */
  public function getEntity() {
    return $this->configuration['entity'];
  }

}