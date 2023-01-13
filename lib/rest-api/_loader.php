<?php

namespace SUPT\StarterpackMods\RestAPI;

use SUPT\StarterpackMods\SpckModsRestApi;

require_once __DIR__ .'/theme.php';

add_action('rest_api_init', __NAMESPACE__ . '\api_init');

function api_init() {
	global $SpckMods;

	if (!is_main_site()) return;

	$SpckMods->RestApi = new SpckModsRestApi();

	$SpckMods->RestApi->Theme = new Theme();
}
