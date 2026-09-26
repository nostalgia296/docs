<script lang="ts">
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';

	let { prevLink, nextLink, locale } = $props();
</script>

<nav
	class="mt-10 grid grid-cols-1 gap-3 border-t border-ios-separator pt-8 sm:mt-12 sm:grid-cols-2 sm:gap-4 sm:pt-10"
	aria-label="Pagination"
>
	{#if prevLink}
		<a
			href={prevLink.link}
			class="group relative flex min-w-0 items-center gap-4 overflow-hidden rounded-2xl border border-ios-separator bg-ios-card p-4 backdrop-blur-sm transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-ios-blue/40 sm:p-5 {nextLink
				? ''
				: 'sm:col-span-2'}"
		>
			<!-- Hover sheen -->
			<span
				class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ios-blue/8 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
			></span>

			<ArrowLeft
				class="h-5 w-5 shrink-0 text-ios-blue transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-x-1.5"
				strokeWidth={2.5}
			/>

			<span class="flex min-w-0 flex-col gap-1">
				<span
					class="font-mono text-[10px] font-medium tracking-[0.2em] text-ios-gray uppercase transition-colors duration-300 group-hover:text-ios-blue"
				>
					{locale.ui.previous}
				</span>
				<span
					class="truncate text-sm font-semibold text-ios-label transition-colors duration-300 group-hover:text-ios-blue sm:text-[15px]"
				>
					{prevLink.text}
				</span>
			</span>
		</a>
	{:else}
		<div class="hidden sm:block"></div>
	{/if}

	{#if nextLink}
		<a
			href={nextLink.link}
			class="group relative flex min-w-0 items-center justify-end gap-4 overflow-hidden rounded-2xl border border-ios-separator bg-ios-card p-4 text-right backdrop-blur-sm transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-ios-blue/40 sm:p-5 {prevLink
				? ''
				: 'sm:col-span-2'}"
		>
			<!-- Hover sheen -->
			<span
				class="pointer-events-none absolute inset-0 translate-x-full bg-gradient-to-l from-transparent via-ios-blue/8 to-transparent transition-transform duration-700 ease-out group-hover:-translate-x-full"
			></span>

			<span class="flex min-w-0 flex-col gap-1">
				<span
					class="font-mono text-[10px] font-medium tracking-[0.2em] text-ios-gray uppercase transition-colors duration-300 group-hover:text-ios-blue"
				>
					{locale.ui.next}
				</span>
				<span
					class="truncate text-sm font-semibold text-ios-label transition-colors duration-300 group-hover:text-ios-blue sm:text-[15px]"
				>
					{nextLink.text}
				</span>
			</span>

			<ArrowRight
				class="h-5 w-5 shrink-0 text-ios-blue transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-1.5"
				strokeWidth={2.5}
			/>
		</a>
	{:else}
		<div class="hidden sm:block"></div>
	{/if}
</nav>
