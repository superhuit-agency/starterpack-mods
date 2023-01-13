declare global {
	interface Window {
		wp:any;
		blocksThemeControls:Array<any>;
		templatesThemeControls:Array<any>;
	}
}

/* @ts-ignore */
import { Action, createReduxStore, register, select } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import {
	Theme,
	getThemeWithFallbacks,
	getFullRawTheme,
	getDecodedTheme,
	DESIGNER_CAPABILITY,
} from '@superhuit/starterpack-customizer';

/**
 * Creates a store using @wordpress/data Redux like state management to be able to handle theme state easilly inside each edit blocks in WP editor
 */

type State = {
	theme: Theme;
	// blocksThemeControls: Array<any>;
	// templatesThemeControls: Array<any>;
	rawTheme: Theme;
	fullRawTheme: Theme;
	initialTheme: object;
	themeHasChanged: boolean;
	canUserUpdateBlockTheme: boolean;
};

/**
 * User properties schema from WP Rest API `/users` endpoint
 * @see https://developer.wordpress.org/rest-api/reference/users/#schema
 */
type UserProps = {
	id                : number;
	username          : string;
	name              : string;
	first_name        : string;
	last_name         : string;
	email             : string;
	url               : string;
	description       : string;
	link              : string;
	locale            : string;
	nickname          : string;
	slug              : string;
	registered_date   : string;
	roles             : Array<string>;
	capabilities      : object;
	extra_capabilities: object;
	avatar_urls       : object;
	meta              : object;
}

const actions = {
	initTheme(initialTheme: object) {
		return {
			type: 'INIT',
			initialTheme,
		};
	},

	updateRawTheme(rawTheme: object) {
		return {
			type: 'UPDATE',
			rawTheme,
		};
	},

	updateBlockTheme(id: string, theme: object) {
		return {
			type: 'UPDATE_BLOCK',
			id,
			theme,
		};
	},

	resetTheme() {
		return {
			type: 'RESET',
		};
	},

	fetchTheme() {
		return {
			type: 'FETCH_THEME',
		};
	},

	saveTheme(rawTheme: object) {
		return {
			type: 'SAVE_THEME',
			rawTheme,
		};
	},

	setCanUserUpdateBlockTheme(canUserUpdateBlockTheme: boolean) {
		return {
			type: 'SET_CAN_USER_UPDATE_BLOCK_THEME',
			canUserUpdateBlockTheme,
		};
	},

	canUserUpdateBlockTheme() {
		return {
			type: 'CAN_USER_UPDATE_BLOCK_THEME',
		};
	},

	// setThemeControls(blocksThemeControls: Array<any>, templatesThemeControls: Array<any>) {
	// 	return {
	// 		type: 'SET_THEME_CONTROLS',
	// 		blocksThemeControls,
	// 		templatesThemeControls,
	// 	};
	// }
};

const store = createReduxStore('spck-theme-store', {
	// Takes the previous state and action as arguments and returns an updated state value.
	reducer(state: State, action: Action) {
		// console.log('========', action.type, state, action);
		switch (action.type) {
			case 'INIT': {
				const fullTheme = getFullRawTheme(action.initialTheme, window.blocksThemeControls, window.templatesThemeControls);
				const decodedTheme = getDecodedTheme(action.initialTheme, window.blocksThemeControls, window.templatesThemeControls);
				// const decodedTheme = getDecodedTheme(fullTheme);

				return {
					...state,
					rawTheme: action.initialTheme,
					fullRawTheme: fullTheme,
					theme: decodedTheme,
					initialTheme: action.initialTheme,
					themeHasChanged: false,
					canUserUpdateBlockTheme: state?.canUserUpdateBlockTheme ?? false
				};
			}

			case 'UPDATE': {
				const fullTheme = getFullRawTheme(action.rawTheme, window.blocksThemeControls, window.templatesThemeControls);
				const decodedTheme = getDecodedTheme(action.rawTheme, window.blocksThemeControls, window.templatesThemeControls);
				// const decodedTheme = getDecodedTheme(fullTheme);

				return {
					...state,
					rawTheme: action.rawTheme,
					fullRawTheme: fullTheme,
					theme: decodedTheme,
					themeHasChanged: true,
				};
			}

			case 'UPDATE_BLOCK': {
				const newRawTheme = {
					...state.rawTheme,
					blocks: {
						...state.rawTheme.blocks,
						[action.id]: action.theme,
					},
				};

				const fullTheme = getFullRawTheme(newRawTheme, window.blocksThemeControls, window.templatesThemeControls);
				const decodedTheme = getDecodedTheme(newRawTheme, window.blocksThemeControls, window.templatesThemeControls);
				// const decodedTheme = getDecodedTheme(fullTheme);

				return {
					...state,
					rawTheme: newRawTheme,
					fullRawTheme: fullTheme,
					theme: decodedTheme,
					themeHasChanged: true,
				};
			}

			case 'RESET': {
				const fullTheme = getFullRawTheme(state.initialTheme, window.blocksThemeControls, window.templatesThemeControls);
				const decodedTheme = getDecodedTheme(state.initialTheme, window.blocksThemeControls, window.templatesThemeControls);
				// const decodedTheme = getDecodedTheme(fullTheme);

				return {
					...state,
					rawTheme: state.initialTheme,
					fullRawTheme: fullTheme,
					theme: decodedTheme,
					themeHasChanged: false,
				};
			}

			case 'SET_CAN_USER_UPDATE_BLOCK_THEME': {
				return {
					...state,
					canUserUpdateBlockTheme: action.canUserUpdateBlockTheme,
				}
			}

			// case 'SET_THEME_CONTROLS': {
			// 	if (!state?.rawTheme) {
			// 		return {
			// 			...state,
			// 			blocksThemeControls: action.blocksThemeControls,
			// 			templatesThemeControls: action.templatesThemeControls,
			// 		}
			// 	}

			// 	const fullTheme = getFullRawTheme(state.rawTheme, action.blocksThemeControls, action.templatesThemeControls);
			// 	const decodedTheme = getDecodedTheme(state.rawTheme, action.blocksThemeControls, action.templatesThemeControls);

			// 	return {
			// 		...state,
			// 		fullRawTheme: fullTheme,
			// 		theme: decodedTheme,
			// 		blocksThemeControls: action.blocksThemeControls,
			// 		templatesThemeControls: action.templatesThemeControls,
			// 	}
			// }
		}

		return state;
	},

	// A set of functions that optionally accept arguments and return an action object to dispatch to the registered reducer to make changes to the state.
	actions,

	// A set of functions which accepts state and optional arguments and returns some value from state => allows to manipulate the raw data of the state only in 1 place.
	selectors: {
		getRawTheme(state: State) {
			return state?.rawTheme;
		},

		getFullRawTheme(state: State) {
			return state?.fullRawTheme;
		},

		getTheme(state: State) {
			return state?.theme;
		},

		getBlockTheme(state: State, id: string) {
			// If no theme yet, fetch theme first
			if (!state || !state.rawTheme) {
				select('spck-theme-store').getRawTheme();
			}
			return state?.theme?.blocks[id];
		},

		getTemplateTheme(state: State, id: string) {
			// If no theme yet, fetch theme first
			if (!state || !state.rawTheme) {
				select('spck-theme-store').getRawTheme();
			}
			return state?.theme?.templates[id];
		},

		// getInitialTheme(state: State) {
		// 	return state?.initialTheme;
		// },

		getThemeStatus(state: State) {
			return state?.themeHasChanged;
		},

		getDesignTokens(state: State) {
			return state?.rawTheme.tokens;
		},

		getCanUserUpdateBlockTheme( state: State) {
			return state?.canUserUpdateBlockTheme;
		},

		// getBlocksThemeControls( state: State) {
		// 	return state?.blocksThemeControls;
		// },

		// getTemplatesThemeControls( state: State) {
		// 	return state?.templatesThemeControls;
		// }
	},

	// A side-effect for a selector => the first time a selector is called, if it has requirements (data from an external source for example), the resolver will first be called to fulfill those requirements.
	// An object where each key is the name of the selector to act upon, the value a function which receives the same arguments passed to the selector, excluding the state argument.
	resolvers: {
		*getRawTheme() {
			// Needs to be same name of the selector linked to
			const rawTheme: object = yield actions.fetchTheme();
			if (rawTheme) {
				return actions.initTheme(rawTheme);
			}

			return;
		},
		*getCanUserUpdateBlockTheme() {
			const canUserUpdateBlockTheme: boolean = yield actions.canUserUpdateBlockTheme();
			return actions.setCanUserUpdateBlockTheme(canUserUpdateBlockTheme);
		}
	},

	// Defines the execution flow behavior associated with a specific action type (like for async data flows for example).
	// An object where each key is the name of the action type to act upon, the value a function which receives the original action object.
	// It should return either a promise which is to resolve when evaluation of the action should continue, or a value.
	controls: {
		FETCH_THEME() {
			return apiFetch<Theme>({ path: '/supt/v1/theme' }).then((theme) =>
				getThemeWithFallbacks(theme)
			);
		},
		SAVE_THEME(rawTheme: Theme) {
			return apiFetch({
				path: '/supt/v1/theme',
				method: 'POST',
				data: rawTheme,
			}).catch((e) => {
				console.warn('Theme could not be fetched.', e);
				return {};
			});
		},
		CAN_USER_UPDATE_BLOCK_THEME() {
			return apiFetch<UserProps>({
				path: '/wp/v2/users/me?context=edit'
			})
			.then(({ capabilities }: UserProps) => {
					return Object.keys(capabilities).includes( DESIGNER_CAPABILITY )
				})
				.catch(err => {
					console.warn('User capabilities could not be retrieved', err)
					return false
				})
		}
	},
});

register(store);
