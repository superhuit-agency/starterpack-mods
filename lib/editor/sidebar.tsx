import React, { useEffect, useState } from 'react';
import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebarMoreMenuItem, PluginSidebar } from '@wordpress/edit-post';
import { useSelect, dispatch } from '@wordpress/data';
import { Flex, FlexItem, Button } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

import { DesignTokens, getVariantsOptions } from '@superhuit/starterpack-customizer';

import DemoContentPanel from './demo-content';

// TODO :: Change css with css-in-js ??

/**
 * THEME PLUGIN ICON
 * Displays Notification icon if theme has changed to alert user that theme needs to be saved
 */
const ThemeSidebarIcon = () => {
	const themeHasChanged = useSelect(
		(select) => select('spck-theme-store').getThemeStatus(),
		[]
	);

	return (
		<span
			className="dashicon dashicons dashicons-admin-customizer"
			style={{ marginRight: '2px', position: 'relative' }}
		>
			<span style={{
				width: '20px',
				height: '20px',
				position: 'absolute',
				top: '-16px',
				right: '-16px',
				backgroundColor: 'red',
				borderRadius: '50%',
				fontSize: '14px',
				fontFamily: 'sans-serif',
				color: '#fff',
				lineHeight: '20px',
				transition: 'opacity 0.4s ease, transform 0.35s ease',
				opacity: themeHasChanged ? 1 : 0,
				transform: `scale(${themeHasChanged ? 1 : 0.1})`
			}}>!</span>
		</span>
	);
};

/**
 * THEME PLUGIN
 * Shows global theming in specific sidebar
 */
const ThemeSidebar = () => {
	const [themeHasSaved, setThemeHasSaved] = useState(false);

	// Get needed values from @wordpress/data stores
	const { isAdmin, isSavingPost, isAutosavingPost, rawTheme, themeHasChanged } = useSelect(
		(select) => {
			return {
				isAdmin: select('core').canUser('create', 'users', ''),
				isSavingPost: select('core/editor').isSavingPost(),
				isAutosavingPost: select('core/editor').isAutosavingPost(),
				rawTheme: select('spck-theme-store').getRawTheme(),
				themeHasChanged: select('spck-theme-store').getThemeStatus(),
			};
		},
		[]
	);

	/**
	 * Saves theme same time post is saving (when WP Post "update" button is clicked) => ONLY if something has been modified in the theme
	 */
	 useEffect(() => {
		if (isSavingPost && !isAutosavingPost && themeHasChanged) {
			onThemeSave();
		}
	}, [isSavingPost, isAutosavingPost, themeHasChanged]);

	/**
	 * Update theme
	 */
	const onThemeChange = (newRawTheme: object) => {
		dispatch('spck-theme-store').updateRawTheme(newRawTheme); // Update theme state
	}

	/**
	 * Save theme
	 */
	const onThemeSave = () => {
		// TODO: figure out why the next line doesn't work? the control "SAVE_THEME" doesn't get called… // then replace the apiFetch() call with line.
		// dispatch('spck-theme-store').saveTheme(rawTheme);
		apiFetch({
			path: '/supt/v1/theme',
			method: 'POST',
			data: rawTheme,
		}).catch((e) => {
			console.warn('Theme could not be saved.', e);
			return {};
		}).then(() => {
			setThemeHasSaved(true);

			// TODO: handle saving states better!
			// - saving…
			// - success
			// - error

			dispatch('spck-theme-store').initTheme(rawTheme); // Reset theme with last saved value

			setTimeout(() => setThemeHasSaved(false), 1500);
		});

	};

	/**
	 * Reset theme to initial value
	 */
	 const resetTheme = () => {
		dispatch('spck-theme-store').resetTheme(); // Reset theme with initial value
	};

	// Display theming in sidebar only if current user is admin
	if(!isAdmin || !rawTheme) return null;

	return (
		<>
			<PluginSidebarMoreMenuItem
				target="theme-sidebar"
				icon="admin-customizer"
			>
				Theme
			</PluginSidebarMoreMenuItem>

			<PluginSidebar name="theme-sidebar" title="Theming" className="supt-theme-sidebar">
				<div>
					<DesignTokens
						theme={rawTheme}
						onChange={
							(value: object) =>
								onThemeChange({
									...rawTheme,
									tokens: value
								}
							)
						}
					/>

					{/* Actions Footer */}
					<div style={{ padding: '15px', borderTop: '1px solid #e0e0e0' }}>
						<Flex justify="flex-end">
							<FlexItem>
								<Button
									isPrimary
									onClick={onThemeSave}
									style={{
										display: 'block',
										marginLeft: 'auto',
									}}
									disabled={!themeHasChanged}
								>
									Save
								</Button>
							</FlexItem>
							<FlexItem>
								<Button
									isLink
									onClick={resetTheme}
									disabled={!themeHasChanged}
								>
									Reset
								</Button>
							</FlexItem>
						</Flex>

						<div
							style={{
								marginTop: '10px',
								position: 'relative',
							}}
						>
							<p
								style={{
									opacity: themeHasChanged ? 1 : 0,
									color: 'red',
									textAlign: 'right',
									transition: 'opacity 0.3s',
									position: 'absolute',
									width: '100%',
								}}
							>
								Don't forget to save the theme !
							</p>
							<p
								style={{
									opacity: themeHasSaved ? 1 : 0,
									transition: 'opacity 0.4s',
									textAlign: 'right',
									position: 'absolute',
									width: '100%',
								}}
							>
								Theme updated.
							</p>
						</div>
					</div>
				</div>

				<DemoContentPanel
					variants={ getVariantsOptions(rawTheme) }
				/>
			</PluginSidebar>
		</>
	);
};

registerPlugin('supt-theme-plugin', {
	icon: ThemeSidebarIcon,
	render: ThemeSidebar,
});
