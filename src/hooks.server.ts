import { config } from '$lib/docs.config';
import type { Handle } from '@sveltejs/kit';

function langFromPath(pathname: string): string {
	const segment = pathname.split('/').filter(Boolean)[0];
	return segment && segment in config.locales ? segment : config.defaultLocale;
}

export const handle: Handle = async ({ event, resolve }) => {
	const lang = langFromPath(event.url.pathname);

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
