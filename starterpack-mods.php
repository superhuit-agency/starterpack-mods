<?php
/**
 * Plugin Name:       Starterpack Mods
 * Plugin URI:        https://github.com/superhuit-agency/starterpack-mods
 * Description:       Starterpack's Customizer mods plugin.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            superhuit <@superhuit>
 * Author URI:        https://profiles.wordpress.org/superhuit/
 * License:           GNU General Public License v3 or later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       spckmods
 *
 * Starterpack Mods is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * any later version.
 *
 * Starterpack Mods is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Starterpack Mods. If not, see {URI to Plugin License}.
*/

use function SUPT\StarterpackMods\register_roles;
use function SUPT\StarterpackMods\remove_roles;
use function SUPT\StarterpackMods\register_capabilities;
use function SUPT\StarterpackMods\remove_capabilities;

defined( 'ABSPATH' ) or die( 'Cheatin&#8217; uh?' );

define( 'SPCKMODS_PLUGIN_VERSION', '1.0.0' );
define( 'SPCKMODS_PATH', __DIR__ );
define( 'SPCKMODS_URL', plugin_dir_url(__FILE__) );


// ====
// Load dependencies
// ====
require_once __DIR__.'/lib/_loader.php';

// ====
// Action & filter hooks
// ====
register_activation_hook( __FILE__, 'spckmods_activate' );
register_deactivation_hook( __FILE__, 'spckmods_deactivate' );
register_uninstall_hook(__FILE__, 'spckmods_uninstall');

/**
 * Execute anything necessary on plugin activation
 */
function spckmods_activate() {
	register_roles();
	register_capabilities();
}

/**
 * Execute anything necessary on plugin deactivation
 */
function spckmods_deactivate() {
	remove_roles();
	remove_capabilities();
}

/**
 * Execute anything necessary on plugin uninstall (deletion)
 */
function spckmods_uninstall() {
	// e.g. remove plugin options from database
}

