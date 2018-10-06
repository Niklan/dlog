<?php

namespace Drupal\dlog\Plugin\DlogHero\Path;

use Drupal\dlog_hero\Plugin\DlogHero\Path\DlogHeroPathPluginBase;
use Drupal\media\MediaInterface;

/**
 * Hero block for path.
 *
 * @DlogHeroPath(
 *   id = "dlog_blog",
 *   match_type = "listed",
 *   match_path = {"/blog"}
 * )
 */
class DlogBlog extends DlogHeroPathPluginBase {

  /**
   * {@inheritdoc}
   */
  public function getHeroSubtitle() {
    return 'Aliquam facilisis auctor lorem placerat scelerisque. Curabitur dignissim felis in porttitor placerat. Ut blandit tortor tortor, ut placerat felis tempor quis. Aenean purus ipsum, euismod a mi id, vestibulum venenatis orci. Nulla gravida erat et metus fringilla, id elementum tortor bibendum. Praesent sed efficitur dolor, in ullamcorper dolor.';
  }

  /**
   * {@inheritdoc}
   */
  public function getHeroImage() {
    /** @var \Drupal\media\MediaStorage $media_storage */
    $media_storage = $this->getEntityTypeManager()->getStorage('media');
    $media_image = $media_storage->load(33);
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
    $media_video = $media_storage->load(32);
    if ($media_video instanceof MediaInterface) {
      return [
        'video/mp4' => $media_video->get('field_media_video_file')->entity->get('uri')->value,
      ];
    }
  }

}
