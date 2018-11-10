<?php

namespace Drupal\dlog_comments\Service;

/**
 * Class for generating letter avatars.
 *
 * @package Drupal\dlog_comments\Service
 */
interface LetterAvatarInterface {

  /**
   * Gets color from username.
   *
   * @param string $username
   *   The user name.
   *
   * @return array
   *   An array with RGB colors.
   */
  public function fromUsername($username);

  /**
   * Gets letter from username.
   *
   * @param string $username
   *   The user name.
   *
   * @return string
   *   The username letter.
   */
  public function getLetterFromUsername($username);

  /**
   * Gets text color by contrast usin YIQ formula.
   *
   * @param string|array $color
   *   The color which will be tested for contrast. Can be array with RGB colors
   *   or HEX color.
   * @param string $text_color_dark
   *   The HEX color for dark text.
   * @param string $text_color_light
   *   The HEX color for light text.
   *
   * @return string
   *   The HEX color for dark or light text compared to $color.
   *
   * @see https://en.wikipedia.org/wiki/YIQ
   */
  public function getTextColor($color, $text_color_dark = '#000000', $text_color_light = '#FFFFFF');

  /**
   * Gets available colors.
   *
   * @return array
   *   An array with RGB colors.
   */
  public function getColors();

}
