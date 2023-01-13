<?php

namespace SUPT\StarterpackMods\Editor;

add_action('enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_editor_assets');

function enqueue_editor_assets() {
	if ( file_exists(SPCKMODS_PATH .'/dist/editor.js') ) {
		$script_deps = apply_filters( 'spckmods-editor-script-deps', [
			'wp-editor', 'wp-blocks', 'wp-dom-ready', 'wp-edit-post',
			'wp-hooks', 'wp-components', 'wp-blocks', 'wp-element',
			'wp-data', 'wp-date', 'wp-i18n', 'wp-api-fetch',
		]);

		$localize_scripts = apply_filters( 'spckmods-localize-script', [] );

		wp_register_script( 'spckmods-editor-script', SPCKMODS_URL .'dist/editor.js', $script_deps, null, true );
		wp_localize_script( 'spckmods-editor-script', 'spckmods', $localize_scripts );
		wp_enqueue_script( 'spckmods-editor-script' );
	}
}
