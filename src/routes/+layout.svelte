<script lang="ts">
	import './layout.css';
	import { browser } from '$app/environment';
	import { config } from '$lib/docs.config';
	import { page } from '$app/stores';
	import { localizePath } from '$lib/i18n';
	import { Layers } from '@lucide/svelte';
	import Search from '$lib/components/docs/Search.svelte';

	let { children } = $props();

	let currentLang = $derived($page.params.lang || config.defaultLocale);
	let locale = $derived(config.locales[currentLang] || config.locales[config.defaultLocale]);

	$effect(() => {
		if (browser) {
			document.documentElement.lang = currentLang;
		}
	});

	// A nav item is active when the current path lives under its section prefix
	function isNavActive(link: string, pathname: string): boolean {
		if (pathname === link) return true;
		const prefix = link.split('/').slice(0, -1).join('/');
		return prefix.length > 1 && pathname.startsWith(prefix);
	}
</script>

<div class="fixed inset-0 z-0" aria-hidden="true">
	<picture>
		<source media="(max-width: 767px)" srcset="/m.jpg" />
		<img src="/8.webp" alt="" class="h-full w-full object-cover" />
	</picture>
	<div class="absolute inset-0 bg-black/70"></div>
</div>

<div class="relative z-10 flex min-h-screen flex-col selection:bg-white selection:text-black">
	<header class="ios-blur sticky top-0 z-50 w-full border-b border-ios-separator">
		<div class="flex h-14 w-full items-center justify-between gap-2 px-3 sm:px-6 lg:px-8">
			<div class="flex min-w-0 items-center gap-3 sm:gap-8">
				<a
					href={currentLang === config.defaultLocale ? '/' : `/${currentLang}`}
					class="group flex min-w-0 items-center gap-2.5"
				>
					<Layers
						class="h-5 w-5 shrink-0 text-ios-blue transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-[-8deg] group-hover:scale-110"
						strokeWidth={2.5}
					/>
					<span class="truncate text-lg font-semibold tracking-tight text-ios-label"
						>{locale.title}</span
					>
				</a>
				<nav class="hidden items-center gap-6 md:flex">
					{#each locale.nav as item (item.link)}
						{@const active = isNavActive(item.link, $page.url.pathname)}
						<a
							href={item.link}
							class="group relative py-1 font-mono text-[11px] font-medium tracking-[0.2em] uppercase transition-colors duration-300 {active
								? 'text-ios-blue'
								: 'text-ios-secondary hover:text-ios-label'}"
						>
							{item.text}
							<span
								class="absolute inset-x-0 -bottom-0.5 h-[2px] origin-left rounded-full bg-ios-blue transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] {active
									? 'scale-x-100'
									: 'scale-x-0 group-hover:scale-x-100'}"
							></span>
						</a>
					{/each}
				</nav>
			</div>

			<div class="flex shrink-0 items-center gap-1 sm:gap-3">
				<Search {locale} lang={currentLang} />

				<!-- Language Switcher -->
				<div
					class="flex items-center gap-2.5 border-l border-ios-separator pl-2.5 sm:gap-3 sm:pl-4"
				>
					{#each Object.keys(config.locales) as langKey (langKey)}
						{@const active = currentLang === langKey}
						<a
							href={localizePath($page.url.pathname, langKey)}
							class="flex items-center gap-1 font-mono text-[11px] font-medium tracking-[0.15em] transition-colors duration-300 {active
								? 'text-ios-blue'
								: 'text-ios-gray hover:text-ios-label'}"
						>
							<span
								class="h-1 w-1 rounded-full bg-ios-blue transition-all duration-300 {active
									? 'scale-100 opacity-100'
									: 'scale-0 opacity-0'}"
							></span>
							{langKey.toUpperCase()}
						</a>
					{/each}
				</div>

				{#each config.socialLinks as link (link.link)}
					{#if link.icon === 'github'}
						<a
							href={link.link}
							target="_blank"
							rel="noopener noreferrer"
							class="text-ios-secondary transition-all duration-300 hover:-translate-y-0.5 hover:text-ios-label"
						>
							<span class="sr-only">GitHub</span>
							<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"
								><path
									fill-rule="evenodd"
									d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
									clip-rule="evenodd"
								/></svg
							>
						</a>
					{/if}
				{/each}
			</div>
		</div>
	</header>

	<main class="flex flex-grow flex-col">
		{@render children()}
	</main>

	<footer class="border-t border-ios-separator">
		<div
			class="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 font-mono text-[11px] tracking-[0.18em] text-ios-secondary uppercase sm:flex-row sm:px-6 lg:px-8"
		>
			<span>© {new Date().getFullYear()} Lai</span>
			<span class="text-ios-gray">All rights reserved</span>
		</div>
	</footer>
</div>
