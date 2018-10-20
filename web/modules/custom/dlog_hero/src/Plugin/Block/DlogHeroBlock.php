<?php

namespace Drupal\dlog_hero\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\dlog_hero\Plugin\DlogHeroPluginManager;
use Drupal\example\ExampleInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'Dlog Hero' block.
 *
 * @Block(
 *   id = "dlog_hero",
 *   admin_label = @Translation("Dlog Hero"),
 *   category = @Translation("Custom")
 * )
 */
class DlogHeroBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The plugin manager for dlog hero entity plugins.
   *
   * @var \Drupal\dlog_hero\Plugin\DlogHeroPluginManager
   */
  protected $dlogHeroEntityManager;

  /**
   * The plugin manager for dlog hero path plugins.
   *
   * @var \Drupal\dlog_hero\Plugin\DlogHeroPluginManager
   */
  protected $dlogHeroPathManager;

  /**
   * Constructs a new DlogHeroBlock instance.
   *
   * @param array $configuration
   *   The plugin configuration, i.e. an array with configuration values keyed
   *   by configuration option name. The special key 'context' may be used to
   *   initialize the defined contexts by setting it to an array of context
   *   values keyed by context names.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\dlog_hero\Plugin\DlogHeroPluginManager $dlog_hero_entity
   *   The plugin manager for dlog hero entity plugins.
   * @param \Drupal\dlog_hero\Plugin\DlogHeroPluginManager $dlog_hero_path
   *   The plugin manager for dlog hero path plugins.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, DlogHeroPluginManager $dlog_hero_entity, DlogHeroPluginManager $dlog_hero_path) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);

    $this->dlogHeroEntityManager = $dlog_hero_entity;
    $this->dlogHeroPathManager = $dlog_hero_path;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('plugin.manager.dlog_hero.entity'),
      $container->get('plugin.manager.dlog_hero.path')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $entity_plugins = $this->dlogHeroEntityManager->getSuitablePlugins();
    $path_plugins = $this->dlogHeroPathManager->getSuitablePlugins();
    $plugins = $entity_plugins + $path_plugins;
    uasort($plugins, '\Drupal\Component\Utility\SortArray::sortByWeightElement');
    $plugin = end($plugins);

    if ($plugin['plugin_type'] == 'entity') {
      /** @var \Drupal\dlog_hero\Plugin\DlogHero\DlogHeroPluginInterface $instance */
      $instance = $this->dlogHeroEntityManager->createInstance($plugin['id'], ['entity' => $plugin['entity']]);
    }

    if ($plugin['plugin_type'] == 'path') {
      $instance = $this->dlogHeroPathManager->createInstance($plugin['id']);
    }

    $build['content'] = [
      '#theme' => 'dlog_hero',
      '#title' => $instance->getHeroTitle(),
      '#subtitle' => $instance->getHeroSubtitle(),
      '#image' => $instance->getHeroImage(),
      '#video' => $instance->getHeroVideo(),
      '#plugin_id' => $instance->getPluginId(),
    ];
    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts() {
    return [
      'url.path',
    ];
  }

}
