<?php

namespace Drupal\dlog_paragraphs\Plugin\paragraphs\Behavior;

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
 *   id = "dlog_paragraphs_code_line_highlight",
 *   label = @Translation("Code line highlight"),
 *   description= @Translation("Highlight code line for focusing."),
 *   weight = 0,
 * )
 */
class CodeLineHighlight extends ParagraphsBehaviorBase {

  /**
   * {@inheritdoc}
   */
  public static function isApplicable(ParagraphsType $paragraphs_type) {
    return $paragraphs_type->id() == 'code';
  }

  /**
   * Extends the paragraph render array with behavior.
   */
  public function view(array &$build, Paragraph $paragraph, EntityViewDisplayInterface $display, $view_mode) {
    $highlighted_lines = $paragraph->getBehaviorSetting($this->getPluginId(), 'highlighted_lines', FALSE);
    if ($highlighted_lines) {
      $build['#attached']['library'][] = 'dlog_paragraphs/highlighted_lines';
      $build['#attributes']['data-highlighted-lines'] = $paragraph->getBehaviorSetting($this->getPluginId(), 'highlighted_lines');
    }
  }

  /**
   * {@inheritdoc}
   */
  public function buildBehaviorForm(ParagraphInterface $paragraph, array &$form, FormStateInterface $form_state) {

    $form['highlighted_lines'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Highlighted lines'),
      '#description' => $this->t('Separate line numbers with commas, and range with :.'),
      '#default_value' => $paragraph->getBehaviorSetting($this->getPluginId(), 'highlighted_lines', ''),
    ];

    return $form;
  }

}
