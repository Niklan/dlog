<?php

namespace Drupal\dlog_taxonomy\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\NodeInterface;
use Drupal\taxonomy\TermInterface;

/**
 * Class with helpers for taxonomy vocabulary tags.
 *
 * @package Drupal\dlog_taxonomy\Service
 */
class TagsHelper implements TagsHelperInterface {

  /**
   * The term storage.
   *
   * @var \Drupal\taxonomy\TermStorageInterface
   */
  protected $termStorage;

  /**
   * The node storage.
   *
   * @var \Drupal\node\NodeStorageInterface
   */
  protected $nodeStorage;

  /**
   * TagsHelper constructor.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->termStorage = $entity_type_manager->getStorage('taxonomy_term');
    $this->nodeStorage = $entity_type_manager->getStorage('node');
  }

  /**
   * {@inheritdoc}
   */
  public function getPromoUri($tid) {
    /** @var \Drupal\taxonomy\TermInterface $term */
    $term = $this->termStorage->load($tid);

    if ($term instanceof TermInterface && $term->bundle() == 'tags') {
      if ($term->get('field_image')->isEmpty()) {
        $last_blog_article_result = $this->nodeStorage->getQuery()
          ->condition('status', NodeInterface::PUBLISHED)
          ->condition('type', 'blog_article')
          ->condition('field_tags', $tid, 'IN')
          ->sort('created', 'DESC')
          ->range(0, 1)
          ->execute();

        if (!empty($last_blog_article_result)) {
          /** @var \Drupal\node\NodeInterface $last_blog_article */
          $last_blog_article = $this->nodeStorage
            ->load(array_shift($last_blog_article_result));

          if ($last_blog_article->hasField('field_image') && !$last_blog_article->get('field_image')->isEmpty()) {
            /** @var \Drupal\media\MediaInterface $media */
            $media = $last_blog_article->get('field_image')->entity;
            /** @var \Drupal\file\FileInterface $file */
            $file = $media->get('field_media_image')->entity;

            return $file->getFileUri();
          }
        }
      }
      else {
        /** @var \Drupal\media\MediaInterface $media */
        $media = $term->get('field_image')->entity;
        /** @var \Drupal\file\FileInterface $file */
        $file = $media->get('field_media_image')->entity;

        return $file->getFileUri();
      }
    }
  }

}
