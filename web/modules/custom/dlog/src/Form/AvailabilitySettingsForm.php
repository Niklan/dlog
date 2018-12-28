<?php

namespace Drupal\dlog\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure Dlog settings for this site.
 */
class AvailabilitySettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'dlog_availability_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['dlog.availability.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['availability_status'] = [
      '#required' => TRUE,
      '#type' => 'textfield',
      '#title' => $this->t('Availability'),
      '#default_value' => $this->config('dlog.availability.settings')->get('status'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('dlog.availability.settings')
      ->set('status', $form_state->getValue('availability_status'))
      ->save();
    parent::submitForm($form, $form_state);
  }

}
