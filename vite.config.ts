import { mdsvex } from 'mdsvex';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import remarkExpressiveCode from 'remark-expressive-code';
import { pluginCopyButton } from './src/lib/expressive-code/copy-button';

function mdsvexExpressiveCodeHack() {
	return (tree: any) => {
		function walk(node: any) {
			if (node.type === 'html' && node.value.includes('expressive-code')) {
				node.value = `{@html ${JSON.stringify(node.value)}}`;
			}
			if (node.children) {
				node.children.forEach(walk);
			}
		}
		walk(tree);
	};
}

/**
 * Globally auto-import components used inside markdown.
 *
 * Scan every html node for a used component (e.g. `<GithubCard …/>`) and inject
 * the matching `import` into the file's top-level `<script>` block — creating one
 * if none exists. This lets authors use these components in any .svx file without
 * manually importing them. If a script already imports the component, we skip it
 * to avoid duplicate-identifier errors.
 *
 * Add new components to GLOBAL_COMPONENTS to make them globally available.
 */
const GLOBAL_COMPONENTS: Record<string, string> = {
	GithubCard: '$lib/components/docs/GithubCard.svelte'
};

function mdsvexGlobalComponents() {
	return (tree: any) => {
		if (!tree?.children) return;

		const used = new Set<string>();
		const walk = (node: any) => {
			if (node.type === 'html' && typeof node.value === 'string') {
				for (const name of Object.keys(GLOBAL_COMPONENTS)) {
					if (node.value.includes(`<${name}`)) used.add(name);
				}
			}
			if (node.children) node.children.forEach(walk);
		};
		walk(tree);

		if (used.size === 0) return;

		// Existing top-level <script> block, if any.
		const scriptNode = tree.children.find(
			(n: any) =>
				n.type === 'html' && typeof n.value === 'string' && n.value.trim().startsWith('<script')
		);
		const existing = scriptNode?.value ?? '';

		const lines = [...used]
			.filter(
				(name) =>
					!new RegExp(`\\bimport\\s+(?:\\{?[^}]*?\\b${name}\\b[^}]*\\}?|[^'"]+?)from`).test(
						existing
					)
			)
			.map((name) => `import ${name} from '${GLOBAL_COMPONENTS[name]}';`);

		if (lines.length === 0) return;

		const imports = lines.join('\n');

		if (scriptNode) {
			scriptNode.value = existing.replace(
				/<script([^>]*)>([\s\S]*?)<\/script>/,
				(_m: string, attrs: string, inner: string) =>
					`<script${attrs}>${imports}\n${inner}</script>`
			);
		} else {
			tree.children.unshift({ type: 'html', value: `<script>${imports}</script>\n` });
		}
	};
}

export default defineConfig({
	build: {
		rollupOptions: {
			external: ['/pagefind/pagefind.js']
		}
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
				warningFilter: (warning) => warning.code !== 'script_context_deprecated'
			},
			adapter: adapter(),
			preprocess: [
				mdsvex({
					extensions: ['.svx', '.md'],
					remarkPlugins: [
						[
							remarkExpressiveCode,
							{
								themes: ['github-light', 'github-dark'],
								plugins: [pluginCopyButton()],
								frames: { showCopyToClipboardButton: false },
								themeCssSelector: (theme: any) =>
									theme.name === 'github-light' ? ':root' : '.dark',
								useDarkModeMediaQuery: false,
								styleOverrides: {
									codeBackground: 'var(--color-ios-card)',
									borderColor: 'var(--color-ios-separator)',
									borderRadius: '0.5rem',
									borderWidth: '1px',
									uiFontFamily: 'var(--font-sans)',
									frames: {
										frameBoxShadowCssValue: 'none',
										editorTabBarBackground: 'var(--color-ios-bg)',
										editorActiveTabBackground: 'var(--color-ios-card)',
										editorActiveTabBorderColor: 'var(--color-ios-separator)',
										editorTabBarBorderBottomColor: 'var(--color-ios-separator)',
										terminalBackground: 'var(--color-ios-card)',
										terminalTitlebarBackground: 'var(--color-ios-bg)',
										terminalTitlebarBorderBottomColor: 'var(--color-ios-separator)',
										inlineButtonBackground: 'var(--color-ios-fill2)',
										inlineButtonBackgroundIdleOpacity: '0',
										inlineButtonBackgroundHoverOrFocusOpacity: '0.8',
										inlineButtonBackgroundActiveOpacity: '1',
										inlineButtonBorder: 'transparent',
										inlineButtonForeground: 'var(--color-ios-secondary)',
										tooltipSuccessBackground: 'var(--color-ios-green)',
										tooltipSuccessForeground: '#ffffff'
									}
								}
							}
						],
						mdsvexExpressiveCodeHack,
						mdsvexGlobalComponents
					]
				})
			],
			extensions: ['.svelte', '.svx', '.md']
		})
	]
});
