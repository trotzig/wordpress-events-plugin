<?php
/**
 * Plugin Name: Trotzig Multi-Calendar Events
 * Plugin URI: https://github.com/trotzig/wordpress-events-plugin
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
  wp_enqueue_style('trotzig-multi-calendar',
    plugins_url('/css/trotzig-multi-calendar.css',__FILE__ ));
}

function trotzig_multi_calendar_plugin($atts) {
  return '<div data-trotzig-multi-calendar="'.$atts['urls'].'">Loading...</div>';
}

add_shortcode('trotzig-multi-calendar', 'trotzig_multi_calendar_plugin');

/**
 * This is our callback function that embeds our phrase in a WP_REST_Response
 */
function trotzig_get_endpoint_feed($request) {
  $feed_url = $request['url']; // e.g. 'https://nbta.no/feed/?post_type=sbta_calendar';
  $content = simplexml_load_file($feed_url);
  $content->registerXPathNamespace('nordicbta','http://nordicbta.com/mrss/');
  $res = $content->xpath('//channel/item');
  $result = [];
  foreach ($res as &$item) {
    $event = $item->xpath('nordicbta:event')[0];
    $row = array();
    $row['title'] = (string)$item->title;
    $row['link'] = (string)$item->link;
    $row['description'] = (string)$item->description;
    $row['startdate'] = (string)$event['startdate'];
    $row['enddate'] = (string)$event['enddate'];
    $row['starttime'] = (string)$event['starttime'];
    $row['endtime'] = (string)$event['endtime'];
    array_push($result, $row);
  }
  return wp_send_json($result);
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

// add the namespace to the RSS opening element
function trotzig_add_rss_namespace() {
  echo "xmlns:nordicbta=\"http://nordicbta.com/mrss/\"\n";
}

function trotzig_add_rss_properties() {
  echo '<nordicbta:event startdate="' . get_field("event_date_start") . '" ' .
    'enddate="' . get_field("event_date_end") . '" ' .
    'starttime="' . get_field("event_time_start") . '" ' .
    'endtime="' . get_field("event_time_end") . '" ' .
    'wholeday="' . get_field("event_datetime_wholeday") . '" />';
}

add_action( 'rss2_ns', 'trotzig_add_rss_namespace' );
add_action( 'rss2_item', 'trotzig_add_rss_properties' );
?>
