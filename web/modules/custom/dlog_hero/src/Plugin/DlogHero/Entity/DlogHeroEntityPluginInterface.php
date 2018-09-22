<?php

namespace Drupal\dlog_hero\Plugin\DlogHero\Entity;

use Drupal\dlog_hero\Plugin\DlogHero\DlogHeroPluginInterface;

/**
 * Interface for DlogHero entity plugin type.
 */
interface DlogHeroEntityPluginInterface extends DlogHeroPluginInterface {

  /**
   * Gets entity type id.
   *
   * @return string
   *   The entity type id.
   */
  public function getEntityType();

  /**
   * Gets entity bundles.
   *
   * @return array
   *   An array with entity type bundles.
   */
  public function getEntityBundle();

  /**
   * Gets current entity.
   *
   * @return \Drupal\Core\Entity\EntityInterface
   *   The entity object.
   */
  public function getEntity();

}
