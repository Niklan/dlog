<?php

namespace Drupal\dlog_hero\Plugin;

use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Path\CurrentPathStack;
use Drupal\Core\Path\PathMatcher;
use Drupal\Core\Plugin\DefaultPluginManager;
use Drupal\Core\Plugin\Factory\ContainerFactory;
use Drupal\Core\Routing\CurrentRouteMatch;
use Symfony\Component\DependencyInjection\Container;

/**
 * DlogHero plugin manager.
 */
class DlogHeroPluginManager extends DefaultPluginManager {

  /**
   * The current path stack.
   *
   * @var \Drupal\Core\Path\CurrentPathStack
   */
  protected $pathCurrent;

  /**
   * The path matcher.
   *
   * @var \Drupal\Core\Path\PathMatcher
   */
  protected $pathMatcher;

  /**
   * The current route match.
   *
   * @var \Drupal\Core\Routing\CurrentRouteMatch
   */
  protected $routeMatch;

  /**
   * DlogHeroPluginManager constructor.
   *
   * @param $type
   *   The DlogHero plugin type.
   * @param \Traversable $namespaces
   *   The namespaces.
   * @param \Drupal\Core\Cache\CacheBackendInterface $cache_backend
   *   The cache backend.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler.
   * @param \Drupal\Core\Path\CurrentPathStack $path_current
   *   The current path stack.
   * @param \Drupal\Core\Path\PathMatcher $path_matcher
   *   The path matcher.
   * @param \Drupal\Core\Routing\CurrentRouteMatch $current_route_match
   *   The current route match.
   */
  public function __construct($type, \Traversable $namespaces, CacheBackendInterface $cache_backend, ModuleHandlerInterface $module_handler, CurrentPathStack $path_current, PathMatcher $path_matcher, CurrentRouteMatch $current_route_match) {

    $this->pathCurrent = $path_current;
    $this->pathMatcher = $path_matcher;
    $this->routeMatch = $current_route_match;

    // E.g. entity => Entity, path => Path.
    $type_camelized = Container::camelize($type);
    $subdir = "Plugin/DlogHero/{$type_camelized}";
    $plugin_interface = "Drupal\dlog_hero\Plugin\DlogHero\{$type_camelized}\DlogHero{$type_camelized}PluginInterface";
    $plugin_definition_annotation_name = "Drupal\dlog_hero\Annotation\DlogHero{$type_camelized}";

    parent::__construct($subdir, $namespaces, $module_handler, $plugin_interface, $plugin_definition_annotation_name);

    $this->defaults += [
      'plugin_type' => $type,
      'enabled' => TRUE,
      'weight' => 0,
    ];

    if ($type == 'path') {
      $this->defaults += [
        'match_type' => 'listed',
      ];
    }

    // Call hook_dlog_hero_TYPE_alter().
    $this->alterInfo("dlog_hero_{$type}");

    $this->setCacheBackend($cache_backend, "dlog_hero:{$type}");
    $this->factory = new ContainerFactory($this->getDiscovery());
  }

  /**
   * Gets suitable plugins for current request.
   */
  public function getSuitablePlugins() {
    $plugin_type = $this->defaults['plugin_type'];

    if ($plugin_type == 'entity') {
      return $this->getSuitableEntityPlugins();
    }

    if ($plugin_type == 'path') {
      return $this->getSuitablePathPlugins();
    }
  }

  /**
   * Gets dlog hero entity plugins suitable for current request.
   */
  protected function getSuitableEntityPlugins() {
    $plugins = [];

    $entity = NULL;
    foreach ($this->routeMatch->getParameters() as $parameter) {
      if ($parameter instanceof EntityInterface) {
        $entity = $parameter;
        break;
      }
    }

    if ($entity) {
      foreach ($this->getDefinitions() as $plugin_id => $plugin) {
        if ($plugin['enabled']) {
          $same_entity_type = $plugin['entity_type'] == $entity->getEntityTypeId();
          $needed_bundle = in_array($entity->bundle(), $plugin['entity_bundle']) || in_array('*', $plugin['entity_bundle']);

          if ($same_entity_type && $needed_bundle) {
            $plugins[$plugin_id] = $plugin;
            $plugins[$plugin_id]['entity'] = $entity;
          }
        }
      }
    }

    uasort($plugins, '\Drupal\Component\Utility\SortArray::sortByWeightElement');
    return $plugins;
  }

  /**
   * Gets dlog hero path plugins suitable for current request.
   */
  protected function getSuitablePathPlugins() {
    $plugins = [];

    foreach ($this->getDefinitions() as $plugin_id => $plugin) {
      if ($plugin['enabled']) {
        $patterns = implode(PHP_EOL, $plugin['match_path']);
        $current_path = $this->pathCurrent->getPath();
        $is_match_path = $this->pathMatcher->matchPath($current_path, $patterns);

        switch ($plugin['match_type']) {
          case 'listed':
          default:
            $math_type = 0;
            break;

          case 'unlisted':
            $math_type = 1;
            break;
        }

        $is_plugin_needed = ($is_match_path xor $math_type);

        if ($is_plugin_needed) {
          $plugins[$plugin_id] = $plugin;
        }
      }
    }

    uasort($plugins, '\Drupal\Component\Utility\SortArray::sortByWeightElement');
    return $plugins;
  }

}
