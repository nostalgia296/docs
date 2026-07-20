<script lang="ts">
	import { config } from '$lib/docs.config';
	import { page } from '$app/stores';

	let currentLang = $derived($page.params.lang || config.defaultLocale);
	let locale = $derived(config.locales[currentLang] || config.locales[config.defaultLocale]);
</script>

<svelte:head>
	<title>{locale.title}</title>
</svelte:head>

<div class="relative isolate overflow-hidden bg-ios-bg">
	<div class="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 sm:pb-32 lg:px-8 lg:py-32">
		<div class="mx-auto max-w-2xl text-center">
			<h1 class="mt-12 text-3xl font-bold tracking-tight text-ios-label sm:mt-32 sm:text-6xl">
				{locale.title.split(' ')[0]}
				<span class="text-ios-blue">{locale.title.split(' ').slice(1).join(' ')}</span>
			</h1>
			<p class="mt-5 text-base leading-7 text-ios-secondary sm:mt-6 sm:text-lg sm:leading-8">
				{locale.description}
			</p>
			<div class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:mt-10">
				<a
					href={currentLang === config.defaultLocale
						? '/docs/getting-started'
						: `/${currentLang}/docs/getting-started`}
					class="rounded-xl bg-ios-blue px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ios-blue-press focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ios-blue active:scale-95"
					>{locale.ui.getStarted}</a
				>
				{#each config.socialLinks as link (link.link)}
					{#if link.icon === 'github'}
						<a
							href={link.link}
							class="group flex items-center gap-2 text-sm leading-6 font-semibold text-ios-label transition-colors hover:text-ios-blue"
						>
							{locale.ui.viewOnGithub}
							<span aria-hidden="true" class="transition-transform group-hover:translate-x-1"
								>→</span
							>
						</a>
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>
