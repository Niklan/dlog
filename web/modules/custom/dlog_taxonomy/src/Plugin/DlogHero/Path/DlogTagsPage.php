<?php

namespace Drupal\dlog_taxonomy\Plugin\DlogHero\Path;

use Drupal\dlog_hero\Plugin\DlogHero\Path\DlogHeroPathPluginBase;
use Drupal\media\MediaInterface;

/**
 * Hero block for path.
 *
 * @DlogHeroPath(
 *   id = "dlog_tags_page",
 *   match_type = "listed",
 *   match_path = {"/tags"}
 * )
 */
class DlogTagsPage extends DlogHeroPathPluginBase {

  /**
   * {@inheritdoc}
   */
  public function getHeroImage() {
    /** @var \Drupal\media\MediaStorage $media_storage */
    $media_storage = $this->getEntityTypeManager()->getStorage('media');
    $media_image = $media_storage->load(34);
    if ($media_image instanceof MediaInterface) {
      return $media_image->get('field_media_image')->entity->get('uri')->value;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getHeroVideo() {
    /** @var \Drupal\media\MediaStorage $media_storage */
    $media_storage = $this->getEntityTypeManager()->getStorage('media');
    $media_video = $media_storage->load(35);
    if ($media_video instanceof MediaInterface) {
      return [
        'video/mp4' => $media_video->get('field_media_video_file')->entity->get('uri')->value,
      ];
    }
  }

}
