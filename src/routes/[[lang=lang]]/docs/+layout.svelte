<script lang="ts">
	import { page } from '$app/stores';
	import { config } from '$lib/docs.config';
	import Sidebar from '$lib/components/docs/Sidebar.svelte';
	import TableOfContents from '$lib/components/docs/TableOfContents.svelte';
	import DocFooter from '$lib/components/docs/DocFooter.svelte';

	let { children } = $props();

	let currentLang = $derived($page.params.lang || config.defaultLocale);
	let locale = $derived(config.locales[currentLang] || config.locales[config.defaultLocale]);

	// Flatten the sidebar items to calculate next/prev links
	let flatSidebarItems = $derived(locale.sidebar.flatMap((section) => section.items || []));

	let currentIndex = $derived(
		flatSidebarItems.findIndex((item) => item.link === $page.url.pathname)
	);

	let prevLink = $derived(currentIndex > 0 ? flatSidebarItems[currentIndex - 1] : null);
	let nextLink = $derived(
		currentIndex >= 0 && currentIndex < flatSidebarItems.length - 1
			? flatSidebarItems[currentIndex + 1]
			: null
	);

	let isMobileSidebarOpen = $state(false);
</script>

<div
	class="flex w-full flex-col px-2 pt-2 pb-20 sm:px-6 sm:pt-4 sm:pb-24 lg:flex-row lg:px-8 lg:pt-10"
>
	<Sidebar {locale} pathname={$page.url.pathname} bind:isMobileOpen={isMobileSidebarOpen} />

	<!-- Main Content -->
	<main class="min-w-0 flex-1 lg:pl-10">
		<article
			data-pagefind-body
			data-pagefind-filter="lang:{currentLang}"
			class="prose-custom rounded-xl border border-ios-separator bg-ios-card px-4 py-6 shadow-sm sm:rounded-2xl sm:p-10"
		>
			{@render children()}
		</article>

		<DocFooter {prevLink} {nextLink} {locale} />
	</main>

	<TableOfContents {locale} />
</div>
