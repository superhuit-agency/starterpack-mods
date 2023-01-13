<?php

namespace SUPT\StarterpackMods;

use SUPT\StarterpackMods\Customizer\Styling\Blocks\ModsBlocks;
use SUPT\StarterpackMods\Customizer\Styling\Fonts\ModsFonts;
use SUPT\StarterpackMods\Customizer\Styling\Colors\ModsColors;
use SUPT\StarterpackMods\Customizer\Styling\Themes\ModsThemes;
use SUPT\StarterpackMods\Customizer\Styling\Typography\ModsTypography;

/**
 * Contains all class's instances
 * for every piece of the puzzle
 * to be able to access anything at any time.
 */
class SpckMods {
	public SpckModsRestApi $RestApi;
}

class SpckModsRestApi {
	public $ROUTE_NAMESPACE;
	public $Theme;

	function __construct() {
		/**
		 * Filters REST API base route namespace.
		 *
		 * @since 0.0.1
		 *
		 * @param string Route namespace
		 */
		$this->ROUTE_NAMESPACE = apply_filters( 'spckmods_api_base_route_namespace', 'spckmods/v1' );
	}
}

$SpckMods = new SpckMods();
