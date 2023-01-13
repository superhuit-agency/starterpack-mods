<?php

namespace SUPT\StarterpackMods;

const DESIGNER_ROLE = 'spck_designer';
const DESIGNER_CAPABILITY = 'spck_design';

const MIN_CAPABILITY = 'edit_theme_options';

/**
 * Register custom roles.
 *
 * @note This function should at least at plugin activation.
 */
function register_roles() {
	$editor_capabilities = get_role( 'editor' )->capabilities;

	add_role(
		DESIGNER_ROLE,
		_x( 'Designer', 'User role name', 'supt' ),
		array_merge(
			$editor_capabilities,
			[
				'customize'          => true,
				'switch_themes'      => true,
				'edit_theme_options' => true,
				// 'manage_options', // TODO not sure designer need it
			]
		),
	);
}

/**
 * Remove custom roles to roles that grant it.
 *
 * @note This function should always be run at plugin de-activation.
 */
function remove_roles() {
	remove_role(DESIGNER_ROLE);
}


/**
 * Grant custom capabilities to roles that have
 * the minimunum capability `MIN_CAPABILITY`
 *
 * @note This function should at least at plugin activation.
 */
function register_capabilities() {
	$roles = get_editable_roles();
	$role_objects = $GLOBALS['wp_roles']->role_objects;

	foreach ($role_objects as $key => $role) {
		if (isset($roles[$key]) && $role->has_cap(MIN_CAPABILITY)) {
			$role->add_cap(DESIGNER_CAPABILITY);
		}
	}
}

/**
 * Remove custom capabillities to roles that grant it.
 *
 * @note This function should always be run at plugin de-activation.
 */
function remove_capabilities() {
	$roles = get_editable_roles();
	$role_objects = $GLOBALS['wp_roles']->role_objects;

	foreach ($role_objects as $key => $role) {
		if (isset($roles[$key]) ) {
			if ($role->has_cap(DESIGNER_CAPABILITY)) $role->remove_cap(DESIGNER_CAPABILITY);
		}
	}
}

/**
 * Make sure the current user has the DESIGNER capability
 *
 * @return boolean
 */
function check_designer_permissions() {
	return current_user_can( DESIGNER_CAPABILITY );
}
