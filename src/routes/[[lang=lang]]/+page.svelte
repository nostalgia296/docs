<script lang="ts">
	import { config } from '$lib/docs.config';
	import { page } from '$app/stores';
	import { ArrowUpRight } from '@lucide/svelte';

	let currentLang = $derived($page.params.lang || config.defaultLocale);
	let locale = $derived(config.locales[currentLang] || config.locales[config.defaultLocale]);
</script>

<svelte:head>
	<title>{locale.title}</title>
</svelte:head>

<div class="relative isolate overflow-hidden bg-ios-bg">
	<!-- Soft ambient glow behind the hero -->
	<div
		aria-hidden="true"
		class="pointer-events-none absolute top-[-14rem] left-1/2 -z-10 h-[28rem] w-[64rem] max-w-none -translate-x-1/2 rounded-full bg-ios-blue/10 blur-3xl dark:bg-ios-blue/[0.14]"
	></div>

	<div class="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pb-32 lg:px-8 lg:py-32">
		<div class="mx-auto max-w-2xl text-center">
			<h1 class="mt-12 text-3xl font-bold tracking-tight text-ios-label sm:mt-32 sm:text-6xl">
				{locale.title.split(' ')[0]}
				<span class="bg-gradient-to-r from-ios-blue to-ios-blue/60 bg-clip-text text-transparent"
					>{locale.title.split(' ').slice(1).join(' ')}</span
				>
			</h1>
			<p class="mt-5 text-base leading-7 text-ios-secondary sm:mt-6 sm:text-lg sm:leading-8">
				{locale.description}
			</p>
			<div class="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-4 sm:mt-10">
				<a
					href={currentLang === config.defaultLocale
						? '/docs/getting-started'
						: `/${currentLang}/docs/getting-started`}
					class="rounded-xl bg-ios-blue px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(0,122,255,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-ios-blue-press hover:shadow-[0_12px_28px_-8px_rgba(0,122,255,0.65)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ios-blue active:translate-y-0 active:scale-95"
					>{locale.ui.getStarted}</a
				>
				{#each config.socialLinks as link (link.link)}
					{#if link.icon === 'github'}
						<a
							href={link.link}
							class="group flex items-center gap-1.5 rounded-xl border border-ios-separator bg-ios-card px-5 py-3 text-sm font-semibold text-ios-label shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-ios-blue/40 hover:text-ios-blue active:translate-y-0 active:scale-95"
						>
							{locale.ui.viewOnGithub}
							<ArrowUpRight
								class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
								strokeWidth={2.5}
							/>
						</a>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>
