<?php

namespace Drupal\dlog\EventSubscriber;

use Drupal\Core\Session\SessionManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Dlog event subscriber.
 */
class DlogSubscriber implements EventSubscriberInterface {

  /**
   * The session manager.
   *
   * @var \Drupal\Core\Session\SessionManagerInterface
   */
  protected $sessionManager;

  /**
   * Constructs event subscriber.
   */
  public function __construct(SessionManagerInterface $session_manager) {
    $this->sessionManager = $session_manager;
  }

  /**
   * Kernel request event handler.
   *
   * @param \Symfony\Component\HttpKernel\Event\GetResponseEvent $event
   *   Response event.
   */
  public function onKernelRequest(GetResponseEvent $event) {
    // For #lazy_builder work for anonymous.
    $this->sessionManager->start();
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    return [
      KernelEvents::REQUEST => ['onKernelRequest'],
    ];
  }

}
