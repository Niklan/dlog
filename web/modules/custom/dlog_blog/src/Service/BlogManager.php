<?php

namespace Drupal\dlog_blog\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\NodeInterface;

/**
 * Simple helpers for blog articles.
 *
 * @package Drupal\dlog_blog\Service
 */
class BlogManager implements BlogManagerInterface {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The node storage.
   *
   * @var \Drupal\Core\Entity\EntityStorageInterface
   */
  protected $nodeStorage;

  /**
   * The node view builder.
   *
   * @var \Drupal\Core\Entity\EntityViewBuilderInterface
   */
  protected $nodeViewBuilder;

  /**
   * BlogManager constructor.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
    $this->nodeStorage = $entity_type_manager->getStorage('node');
    $this->nodeViewBuilder = $entity_type_manager->getViewBuilder('node');
  }

  /**
   * {@inheritdoc}
   */
  public function getRelatedPostsWithExactSameTags(NodeInterface $node, $limit = 2) {
    $result = &drupal_static(this::class . '_' . __METHOD__ . '_' . $node->id() . '_' . $limit);

    if (!isset($result)) {
      if ($node->hasField('field_tags') && !$node->get('field_tags')->isEmpty()) {
        $query = $this->nodeStorage->getQuery()
          ->condition('status', NodeInterface::PUBLISHED)
          ->condition('type', 'blog_article')
          ->condition('nid', $node->id(), '<>')
          ->range(0, $limit);
        $query->addTag('entity_query_random');

        foreach ($node->get('field_tags')->getValue() as $field_tag) {
          $and = $query->andConditionGroup();
          $and->condition('field_tags', $field_tag['target_id']);
          $query->condition($and);
        }

        $result = $query->execute();
      }
      else {
        $result = [];
      }
    }

    return $result;
  }

  /**
   * {@inheritdoc}
   */
  public function getRelatedPostsWithSameTags(NodeInterface $node, array $exclude_ids = [], $limit = 2) {
    $result = &drupal_static(this::class . '_' . __METHOD__ . '_' . $node->id() . '_' . $limit);

    if (!isset($result)) {
      if ($node->hasField('field_tags') && !$node->get('field_tags')->isEmpty()) {
        $field_tags_ids = [];
        foreach ($node->get('field_tags')->getValue() as $field_tag) {
          $field_tags_ids[] = $field_tag['target_id'];
        }

        $query = $this->nodeStorage->getQuery()
          ->condition('status', NodeInterface::PUBLISHED)
          ->condition('type', 'blog_article')
          ->condition('nid', $node->id(), '<>')
          ->condition('field_tags', $field_tags_ids, 'IN')
          ->range(0, $limit);

        if (!empty($exclude_ids)) {
          $query->condition('nid', $exclude_ids, 'NOT IN');
        }

        $query->addTag('entity_query_random');

        $result = $query->execute();
      }
      else {
        $result = [];
      }
    }

    return $result;
  }

  /**
   * {@inheritdoc}
   */
  public function getRandomPosts($limit = 2, array $exclude_ids = []) {
    $query = $this->nodeStorage->getQuery()
      ->condition('status', NodeInterface::PUBLISHED)
      ->condition('type', 'blog_article')
      ->range(0, $limit);

    if (!empty($exclude_ids)) {
      $query->condition('nid', $exclude_ids, 'NOT IN');
    }

    $query->addTag('entity_query_random');

    return $query->execute();
  }

  /**
   * {@inheritdoc}
   */
  public function getRelatedPosts(NodeInterface $node, $max = 4, $exact_tags = 2) {
    $result = &drupal_static(this::class . '_' . __METHOD__ . '_' . $node->id() . '_' . $max . '_' . $exact_tags);

    if (!isset($result)) {
      if ($exact_tags > $max) {
        $exact_tags = $max;
      }
      $exclude_ids = [
        $node->id(),
      ];

      $counter = 0;
      $result = [];
      if ($exact_tags > 0) {
        $exact_same = $this->getRelatedPostsWithExactSameTags($node, $exact_tags);
        $result += $exact_same;
        $counter += count($exact_same);

        $exclude_ids += $exact_same;
      }

      if ($counter < $max) {
        $same_tags = $this->getRelatedPostsWithSameTags($node, $exclude_ids, ($max - $counter));
        $result += $same_tags;
        $counter += count($same_tags);

        $exclude_ids += $same_tags;
      }

      if ($counter < $max) {
        $random = $this->getRandomPosts(($max - $counter), $exclude_ids);
        $result += $random;
      }
    }

    return $result;
  }

}
