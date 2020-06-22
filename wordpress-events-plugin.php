<?php
/**
 * Plugin Name: Trotzig Multi-Calendar Events
 * Plugin URI: https://trotzigform.se
 * Description: Display multiple calendars in one view
 * Version: 0.1
 * Text Domain: trotzig-multi-calendar
 * Author: Henric Trotzig
 * Author URI: https://happo.io
 */

add_action('wp_enqueue_scripts','trotzig_multi_calendar_js');

function trotzig_multi_calendar_js() {
  wp_enqueue_script('trotzig-multi-calendar',
    plugins_url('/js/trotzig-multi-calendar.js', __FILE__ ));
}

function trotzig_multi_calendar_plugin($atts) {
  $url = "https://nbta.no/feed/?post_type=sbta_calendar";
  $Content .= '<div data-trotzig-multi-calendar="'.$url.'">Loading...</div>';
  return $Content;
}

add_shortcode('trotzig-multi-calendar', 'trotzig_multi_calendar_plugin');

/**
 * This is our callback function that embeds our phrase in a WP_REST_Response
 */
function trotzig_get_endpoint_feed() {
  $feed_url = 'https://nbta.no/feed/?post_type=sbta_calendar';
  $content = file_get_contents($feed_url);
  return rest_ensure_response($content);
}

/**
 * This function is where we register our routes for our example endpoint.
 */
function trotzig_register_routes() {
    // register_rest_route() handles more arguments but we are going to stick to the basics for now.
    register_rest_route( 'trotzig-multi-calendar', '/get-feed', array(
        'methods'  => WP_REST_Server::READABLE,
        'callback' => 'trotzig_get_endpoint_feed',
    ) );
}

add_action( 'rest_api_init', 'trotzig_register_routes' );
?>
