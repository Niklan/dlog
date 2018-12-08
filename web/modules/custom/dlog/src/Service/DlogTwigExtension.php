<?php

namespace Drupal\dlog\Service;

use Drupal\Core\Config\ConfigFactoryInterface;

/**
 * Twig extension.
 */
class DlogTwigExtension extends \Twig_Extension {

  /**
   * The config factory interface.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * Constructs a new DlogTwigExtension instance.
   */
  public function __construct(ConfigFactoryInterface $config_factory) {
    $this->configFactory = $config_factory;
  }

  /**
   * {@inheritdoc}
   */
  public function getFunctions() {
    return [
      new \Twig_SimpleFunction('dlog_availability_status', function () {
        $availability_settings = $this->configFactory->get('dlog.availability.settings');
        
        return $availability_settings->get('status');
      }),
    ];
  }

}
