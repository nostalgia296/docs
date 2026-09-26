<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { PanelLeft, X, ChevronRight, ArrowUpRight } from '@lucide/svelte';

	let { locale, pathname, isMobileOpen = $bindable(false) } = $props();

	// Lock body scroll while the mobile drawer is open
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.body.style.overflow = isMobileOpen ? 'hidden' : '';
		}
	});

	afterNavigate(() => {
		isMobileOpen = false;
	});

	let totalItems = $derived(
		locale.sidebar.reduce(
			(sum: number, section: { items?: unknown[] }) => sum + (section.items?.length ?? 0),
			0
		)
	);

	// Global running index across sections, for the mono numbering (01, 02, ...)
	function globalIndex(sectionIndex: number, itemIndex: number): number {
		let count = 0;
		for (let i = 0; i < sectionIndex; i++) {
			count += locale.sidebar[i].items?.length ?? 0;
		}
		return count + itemIndex;
	}
</script>

{#snippet navItems(mobile: boolean)}
	<ul class="flex flex-col {mobile ? 'gap-8' : 'gap-7'}">
		{#each locale.sidebar as section, si (section.text)}
			<li>
				<!-- Section heading: experimental mono index + hairline -->
				<div class="mb-3 flex items-baseline gap-3 px-1">
					<span class="font-mono text-[10px] font-medium tracking-widest text-ios-gray3">
						{String(si + 1).padStart(2, '0')}
					</span>
					<h2
						class="text-[11px] font-semibold tracking-[0.18em] whitespace-nowrap text-ios-gray uppercase"
					>
						{section.text}
					</h2>
					<span class="h-px flex-1 self-center bg-ios-separator"></span>
				</div>

				{#if section.items}
					<ul class="flex flex-col gap-0.5">
						{#each section.items as link, ii (link.link)}
							{@const active = pathname === link.link}
							<li>
								{#if mobile}
									<a
										href={link.link}
										in:fly={{
											x: -24,
											duration: 400,
											delay: 120 + globalIndex(si, ii) * 45,
											easing: cubicOut
										}}
										class="group relative flex items-center gap-3 overflow-hidden {active
											? ''
											: 'rounded-2xl'} px-4 py-3 text-[15px] transition-colors duration-200 {active
											? 'bg-ios-blue/12 font-semibold text-ios-blue dark:bg-ios-blue/20'
											: 'text-ios-secondary hover:bg-ios-fill hover:text-ios-label'}"
									>
										<span
											class="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-ios-blue transition-all duration-300 {active
												? 'scale-y-100 opacity-100'
												: 'scale-y-0 opacity-0'}"
										></span>
										<span class="font-mono text-[10px] tracking-widest text-ios-gray3">
											{String(globalIndex(si, ii) + 1).padStart(2, '0')}
										</span>
										<span class="min-w-0 flex-1 truncate">{link.text}</span>
										<ArrowUpRight
											class="h-4 w-4 shrink-0 text-ios-blue transition-all duration-300 {active
												? 'translate-0 opacity-100'
												: '-translate-x-1 opacity-0 group-hover:translate-0 group-hover:opacity-100'}"
											strokeWidth={2.5}
										/>
									</a>
								{:else}
									<a
										href={link.link}
										class="group relative flex items-center gap-2.5 {active
											? ''
											: 'rounded-xl'} py-2 pr-3 pl-3 text-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] {active
											? 'bg-gradient-to-r from-ios-blue/15 via-ios-blue/8 to-transparent font-medium text-ios-blue dark:from-ios-blue/25 dark:via-ios-blue/12'
											: 'text-ios-secondary hover:translate-x-1 hover:bg-ios-fill hover:text-ios-label'}"
									>
										<!-- Animated accent bar -->
										<span
											class="absolute top-1/2 left-0 h-[60%] w-[2.5px] -translate-y-1/2 rounded-full bg-gradient-to-b from-ios-blue to-ios-blue/40 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] {active
												? 'scale-y-100 opacity-100'
												: 'scale-y-0 opacity-0'}"
										></span>
										<span
											class="font-mono text-[10px] tracking-wider transition-colors duration-300 {active
												? 'text-ios-blue/70'
												: 'text-ios-gray3 group-hover:text-ios-gray'}"
										>
											{String(globalIndex(si, ii) + 1).padStart(2, '0')}
										</span>
										<span class="min-w-0 flex-1 truncate">{link.text}</span>
										<ChevronRight
											class="h-4 w-4 shrink-0 text-ios-blue transition-all duration-300 {active
												? 'translate-0 opacity-100'
												: '-translate-x-1 opacity-0 group-hover:translate-0 group-hover:opacity-100'}"
											strokeWidth={2.5}
										/>
									</a>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<!-- Mobile Trigger -->
<div class="mb-4 lg:hidden">
	<button
		onclick={() => (isMobileOpen = true)}
		class="group flex w-full items-center justify-between rounded-2xl border border-ios-separator bg-transparent px-4 py-3 backdrop-blur-xs transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-ios-blue/30 hover:shadow-md active:scale-[0.985]"
		aria-label={locale.ui.menu || 'Menu'}
	>
		<span class="flex items-center gap-3">
			<PanelLeft class="h-5 w-5 shrink-0 text-ios-blue" strokeWidth={2.5} />
			<span class="text-sm font-medium text-ios-label">{locale.ui.menu || 'Menu'}</span>
			<span
				class="rounded-full bg-ios-fill px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider text-ios-secondary"
			>
				{String(totalItems).padStart(2, '0')}
			</span>
		</span>
		<ChevronRight
			class="h-4 w-4 text-ios-blue transition-transform duration-300 group-hover:translate-x-0.5"
			strokeWidth={2.5}
		/>
	</button>
</div>

<!-- Desktop Sidebar -->
<aside class="hidden lg:block lg:w-64 lg:shrink-0 lg:pr-8">
	<nav class="sticky top-24 max-h-[calc(100vh-8rem)] scrollbar-thin overflow-y-auto pt-1 pb-8">
		{@render navItems(false)}
	</nav>
</aside>

<!-- Mobile Drawer -->
{#if isMobileOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-[60] bg-black/30 backdrop-blur-md lg:hidden"
		onclick={() => (isMobileOpen = false)}
		onkeydown={(e) => e.key === 'Escape' && (isMobileOpen = false)}
		role="button"
		tabindex="0"
		aria-label="Close menu"
		transition:fade={{ duration: 250 }}
	></div>

	<!-- Panel -->
	<div
		class="fixed inset-y-0 left-0 z-[70] flex w-[86vw] max-w-sm flex-col border-r border-ios-separator bg-ios-bg shadow-2xl lg:hidden"
		transition:fly={{ x: '-100%', duration: 380, easing: cubicOut }}
		role="dialog"
		aria-modal="true"
		aria-label={locale.ui.menu || 'Menu'}
	>
		<!-- Drawer header -->
		<div class="flex shrink-0 items-center justify-between border-b border-ios-separator px-5 py-4">
			<div class="flex items-baseline gap-2.5">
				<span class="font-mono text-[10px] font-medium tracking-[0.2em] text-ios-blue uppercase">
					{locale.title}
				</span>
				<span class="text-sm font-semibold text-ios-label">{locale.ui.menu || 'Menu'}</span>
			</div>
			<button
				class="flex h-9 w-9 items-center justify-center rounded-full bg-ios-fill text-ios-secondary transition-all duration-200 hover:rotate-90 hover:bg-ios-fill2 hover:text-ios-label active:scale-90"
				onclick={() => (isMobileOpen = false)}
				aria-label="Close"
			>
				<X class="h-4.5 w-4.5" strokeWidth={2} />
			</button>
		</div>

		<!-- Drawer nav -->
		<nav class="flex-1 scrollbar-thin overflow-y-auto px-3 py-5">
			{@render navItems(true)}
		</nav>

		<!-- Drawer footer: progress hint -->
		<div class="shrink-0 border-t border-ios-separator px-5 py-3.5">
			<div
				class="flex items-center justify-between font-mono text-[10px] tracking-widest text-ios-gray uppercase"
			>
				<span>{String(totalItems).padStart(2, '0')} notes</span>
				<span class="text-ios-gray3">{locale.title}</span>
			</div>
		</div>
	</div>
{/if}
