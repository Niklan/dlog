<?php

namespace Drupal\dlog_hero\Generator;

use Drupal\Core\Entity\ContentEntityType;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use DrupalCodeGenerator\Command\BaseGenerator;
use DrupalCodeGenerator\Utils;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\ChoiceQuestion;
use Symfony\Component\Console\Question\ConfirmationQuestion;

/**
 * Dlog hero plugin generator for drush.
 */
class DlogHeroPluginGenerator extends BaseGenerator {

  /**
   * {@inheritdoc}
   */
  protected $name = 'plugin-dlog-hero';

  /**
   * {@inheritdoc}
   */
  protected $alias = 'dh';

  /**
   * {@inheritdoc}
   */
  protected $description = 'Generates DlogHero plugin.';

  /**
   * {@inheritdoc}
   */
  protected $templatePath = __DIR__ . '/templates';

  /**
   * The entity manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * DlogHeroPluginGenerator constructor.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity manager.
   * @param string $name
   *   The command name.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, $name = NULL) {
    parent::__construct($name);

    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public function interact(InputInterface $input, OutputInterface $output) {
    $questions = Utils::defaultPluginQuestions();
    $this->askForPluginType($questions);

    $questions['is_title'] = new ConfirmationQuestion(t('Do you want to customize title?'), FALSE);
    $questions['is_subtitle'] = new ConfirmationQuestion(t('Do you want to add subtitle?'), FALSE);
    $questions['is_image'] = new ConfirmationQuestion(t('Do you want to specify image?'), FALSE);
    $questions['is_video'] = new ConfirmationQuestion(t('Do you want to specify video?'), FALSE);

    $vars = &$this->collectVars($input, $output, $questions);
    $vars['name'] = Utils::camelize($vars['plugin_id']);
    $vars['type'] = Utils::camelize($vars['dlog_hero_plugin_type']);
    $vars['twig_template'] = 'dlog-hero-' . $vars['dlog_hero_plugin_type'] . '-plugin.html.twig';

    // Additional questions.
    $questions = [];

    if ($vars['dlog_hero_plugin_type'] == 'path') {
      $questions['match_type'] = new ChoiceQuestion(t('Match type for path'), [
        'listed' => t('Only on listed page'),
        'unlisted' => t('All except listed'),
      ], 'listed');
    }

    if ($vars['dlog_hero_plugin_type'] == 'entity') {
      $entity_types = [];
      foreach ($this->entityTypeManager->getDefinitions() as $entity_type_id => $entity_type) {
        if ($entity_type instanceof ContentEntityType) {
          $entity_types[$entity_type_id] = $entity_type->getLabel();
        }
      }
      $questions['entity_type'] = new ChoiceQuestion(t('Entity type'), $entity_types);
    }

    $vars = &$this->collectVars($input, $output, $questions, $vars);

    $this->addFile()
      ->path('src/Plugin/DlogHero/{type}/{name}.php')
      ->template($vars['twig_template']);
  }

  /**
   * Asks for preferred plugin type.
   */
  public function askForPluginType(&$question) {
    $dlog_hero_plugin_types = [
      'path' => 'DlogHero Path plugin',
      'entity' => 'DlogHero Entity plugin',
    ];

    $question['dlog_hero_plugin_type'] = new ChoiceQuestion(
      t('What plugin type do you want to create?'),
      $dlog_hero_plugin_types
    );
  }

}

