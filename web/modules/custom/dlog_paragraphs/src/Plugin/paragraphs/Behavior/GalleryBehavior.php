<?php

namespace Drupal\dlog_paragraphs\Plugin\paragraphs\Behavior;

use Drupal\Component\Utility\Html;
use Drupal\Core\Annotation\Translation;
use Drupal\Core\Entity\Display\EntityViewDisplayInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\paragraphs\Annotation\ParagraphsBehavior;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\paragraphs\Entity\ParagraphsType;
use Drupal\paragraphs\ParagraphInterface;
use Drupal\paragraphs\ParagraphsBehaviorBase;

/**
 * @ParagraphsBehavior(
 *   id = "dlog_paragraphs_gallery",
 *   label = @Translation("Gallery settings"),
 *   description= @Translation("Settings for gallery paragraph type."),
 *   weight = 0,
 * )
 */
class GalleryBehavior extends ParagraphsBehaviorBase {

  /**
   * {@inheritdoc}
   */
  public static function isApplicable(ParagraphsType $paragraphs_type) {
    return $paragraphs_type->id() == 'gallery';
  }

  /**
   * Extends the paragraph render array with behavior.
   */
  public function view(array &$build, Paragraph $paragraph, EntityViewDisplayInterface $display, $view_mode) {
    $images_per_row = $paragraph->getBehaviorSetting($this->getPluginId(), 'items_per_row', 4);
    $bem_block = 'paragraph-' . $paragraph->bundle() . ($view_mode == 'default' ? '' : '-' . $view_mode);
    $build['#attributes']['class'][] = Html::getClass($bem_block . '--images-per-row-' . $images_per_row);

    // @todo Image styles for different images per row.
    if (isset($build['field_images']) && $build['field_images']['#formatter'] == 'photoswipe_field_formatter') {
      switch ($images_per_row) {
        case 4:
        default:
          $image_style = 'paragraph_gallery_image_3_of_12';
          break;

        case 3:
          $image_style = 'paragraph_gallery_image_4_of_12';
          break;

        case 2:
          $image_style = 'paragraph_gallery_image_6_of_12';
          break;
      }

      for ($i = 0; $i < count($build['field_images']['#items']); $i++) {
        $build['field_images'][$i]['#display_settings']['photoswipe_node_style'] = $image_style;
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function buildBehaviorForm(ParagraphInterface $paragraph, array &$form, FormStateInterface $form_state) {

    $form['items_per_row'] = [
      '#type' => 'select',
      '#title' => $this->t('Number of images per row'),
      '#options' => [
        '2' => $this->formatPlural(2, '1 photo per row', '@count photos per row'),
        '3' => $this->formatPlural(3, '1 photo per row', '@count photos per row'),
        '4' => $this->formatPlural(4, '1 photo per row', '@count photos per row'),
      ],
      '#default_value' => $paragraph->getBehaviorSetting($this->getPluginId(), 'items_per_row', 4),
    ];

    return $form;
  }

}
