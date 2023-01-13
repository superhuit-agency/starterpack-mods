<?php

namespace SUPT\StarterpackMods\RestAPI;

use WP_Error;
use WP_REST_Server;
use WP_REST_Response;
use WP_REST_Controller;
use WP_REST_Request;

class Theme extends WP_REST_Controller {

	const FILE_EXT = 'json';

	/** @var string $dir Directory where config files are saved. */
	private $dir = 'spckmods';

	/** @var string $basename Config file's basename. */
	private $basename = 'theme';


	public function __construct()	{
		global $SpckMods;

		$this->namespace = $SpckMods->RestApi->ROUTE_NAMESPACE;
		$this->rest_base = 'theme';

		// Init
		$wp_upload_dir = wp_upload_dir();

		/**
		 * Filters the directory where to save the theme config files.
		 *
		 * @since 0.0.1
		 *
		 * @param string $dir Directory where theme config files are saved.
		 */
		$this->dir = apply_filters( 'spckmods_theme_directory', "{$wp_upload_dir['basedir']}/{$this->dir}" );

		// Make sur the directory is created
		if ( !file_exists($this->dir) ) mkdir( $this->dir, 0777, true );


		/**
		 * Filters the theme config file's basename.
		 *
		 * @since 0.0.1
		 *
		 * @param string $basename Filename without the extension (basename).
		 */
		$this->filename = apply_filters( 'spckmods_theme_basename', $this->basename );


		$this->register_routes();
	}

	public function register_routes() {
		register_rest_route($this->namespace, "/{$this->rest_base}", [
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [$this, 'get_theme'],
				'permission_callback' => '__return_true',
			]
		]);
		register_rest_route($this->namespace, "/{$this->rest_base}", [
			[
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => [$this, 'update_theme'],
				'permission_callback' => '__return_true', // 'SUPT\StarterpackMods\check_designer_permissions',
			]
		]);

		register_rest_route($this->namespace, "/{$this->rest_base}/revisions", [
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [$this, 'get_revisions'],
				'permission_callback' => '__return_true',
			]
		]);
		register_rest_route($this->namespace, "/{$this->rest_base}/revisions/(?P<time>\d+)", [
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [$this, 'get_theme'],
				'permission_callback' => '__return_true',
				'args'                => [
					'time' => [
						'required' => true,
						'type'     => 'int',
					]
				],
			]
		]);
	}

	private function get_filepath($time = null) {

		$filename = ( empty($time)
			? sprintf( '%s.%s', $this->basename, self::FILE_EXT )
			: sprintf( '%s-%s.%s', $this->basename, $time, self::FILE_EXT )
		);

		return "{$this->dir}/$filename";
	}

	public function get_theme($request) {

		$filepath = $this->get_filepath( $request->get_param('time') );

		$config = null;
		if ( file_exists($filepath) ) $config = file_get_contents( $filepath );

		try {
			$config = json_decode( $config, true );
		}
		catch (\Throwable $th) {
			$config = null;
		}

		return new WP_REST_Response( is_null($config) ? [] : $config );
	}

	/**
	 * Retrieve a list of all theme config revisions,
	 * ordered by newest first.
	 *
	 * @param WP_REST_Request $request Full data about the request.
   * @return WP_REST_Response
	 */
	public function get_revisions(WP_REST_Request $request) {
		return new WP_REST_Response(
			array_map( function($filename) use ($request) {
				preg_match("/.*-(\d+).json/", $filename, $matches);
				return $this->prepare_revision_for_response($matches[1]);
			}, array_reverse(glob("{$this->dir}/{$this->filename}-*.json")) )
		);
	}

	/**
	 * Retrieve theme config revision
	 *
	 * @param int $revision The revision id
   * @return array
	 */
	private function prepare_revision_for_response( int $revision ) {
		return [
			'revision' => $revision,
			'date'     => date('c', $revision),
			'link'     => rest_url( "{$this->namespace}/{$this->rest_base}/revisions/{$revision}/" ),
		];
	}

	/**
   * Update & save theme config
   *
   * @param WP_REST_Request $request Full data about the request.
   * @return WP_Error|WP_REST_Response
   */
	public function update_theme(WP_REST_Request $request) {

		$revision            = time();
		$config              = $request->get_body();
		$versionned_filepath = $this->get_filepath( $revision );
		$success             = file_put_contents( $versionned_filepath, $config, LOCK_EX);

		if ( $success ) {
			$current_filepath = $this->get_filepath();
			if (file_exists($current_filepath) ) {
				unlink($current_filepath);
			}

			$success = copy($versionned_filepath, $current_filepath);
		}

		return ( FALSE === $success
			? new WP_Error()
			: new WP_REST_Response( $this->prepare_revision_for_response($revision) )
		);
	}

}
