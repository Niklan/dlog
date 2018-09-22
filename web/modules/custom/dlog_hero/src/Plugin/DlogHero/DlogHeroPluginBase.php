<?php

namespace Drupal\dlog_hero\Plugin\DlogHero;

use Drupal\Component\Plugin\PluginBase;
use Drupal\Core\Controller\TitleResolverInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\CurrentRouteMatch;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * The base for all DlogHero plugins.
 */
abstract class DlogHeroPluginBase extends PluginBase implements DlogHeroPluginInterface, ContainerFactoryPluginInterface {

  /**
   * The current request.
   *
   * @var \Symfony\Component\HttpFoundation\Request
   */
  protected $request;

  /**
   * The current route match.
   *
   * @var \Drupal\Core\Routing\CurrentRouteMatch
   */
  protected $routeMatch;

  /**
   * The current page title.
   *
   * @var array|null|string
   */
  protected $pageTitle;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * DlogHeroPluginBase constructor.
   *
   * @param array $configuration
   *   The configuration.
   * @param string $plugin_id
   *   The plugin ID.
   * @param mixed $plugin_definition
   *   The plugin definition.
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The current request.
   * @param \Drupal\Core\Routing\CurrentRouteMatch $current_route_match
   *   The current route match.
   * @param \Drupal\Core\Controller\TitleResolverInterface $title_resolver
   *   The title resolver.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   */
  public function __construct(array $configuration, string $plugin_id, $plugin_definition, Request $request, CurrentRouteMatch $current_route_match, TitleResolverInterface $title_resolver, EntityTypeManagerInterface $entity_type_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);

    $this->request = $request;
    $this->routeMatch = $current_route_match;
    $this->pageTitle = $title_resolver->getTitle($this->request, $this->routeMatch->getRouteObject());
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('request_stack')->getCurrentRequest(),
      $container->get('current_route_match'),
      $container->get('title_resolver'),
      $container->get('entity_type.manager')
    );
  }

  /**
   * Gets current request.
   *
   * @return \Symfony\Component\HttpFoundation\Request
   *   The current request.
   */
  public function getRequest() {
    return $this->request;
  }

  /**
   * Gets current route match.
   *
   * @return \Drupal\Core\Routing\CurrentRouteMatch
   *   The current route match.
   */
  public function getRouteMatch() {
    return $this->routeMatch;
  }

  /**
   * Gets current page title.
   *
   * @return array|null|string
   *   The page title.
   */
  public function getPageTitle() {
    return $this->pageTitle;
  }

  /**
   * Gets entity type manager.
   *
   * @return \Drupal\Core\Entity\EntityTypeManagerInterface
   *   The entity type manager.
   */
  public function getEntityTypeManager() {
    return $this->entityTypeManager;
  }

  /**
   * {@inheritdoc}
   */
  public function getEnabled() {
    return $this->pluginDefinition['enabled'];
  }

  /**
   * {@inheritdoc}
   */
  public function getWeight() {
    return $this->pluginDefinition['weight'];
  }

  /**
   * {@inheritdoc}
   */
  public function getHeroTitle() {
    return $this->getPageTitle();
  }

  /**
   * {@inheritdoc}
   */
  public function getHeroSubtitle() {
    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function getHeroImage() {
    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function getHeroVideo() {
    return [];
  }

}
