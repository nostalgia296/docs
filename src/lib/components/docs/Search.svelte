<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import type { LocaleConfig } from '$lib/docs.config';
	import { onMount } from 'svelte';

	type PagefindSearchOptions = {
		filters?: Record<string, string | string[]>;
	};

	type PagefindSearchResult = {
		data: () => Promise<PagefindSearchData>;
	};

	type PagefindSearchResponse = {
		results: PagefindSearchResult[];
	};

	type PagefindSearchData = {
		url: string;
		excerpt?: string;
		plain_excerpt?: string;
		meta?: Record<string, string>;
		sub_results?: Array<{
			title?: string;
			url?: string;
			excerpt?: string;
			plain_excerpt?: string;
		}>;
	};

	type Pagefind = {
		init: () => Promise<void> | void;
		destroy?: () => Promise<void> | void;
		search: (query: string, options?: PagefindSearchOptions) => Promise<PagefindSearchResponse>;
		debouncedSearch?: (
			query: string,
			options?: PagefindSearchOptions,
			timeout?: number
		) => Promise<PagefindSearchResponse | null>;
		preload?: (query: string, options?: PagefindSearchOptions) => Promise<void> | void;
	};

	interface SearchDoc {
		href: string;
		title: string;
		description: string;
		excerpt: string;
	}

	let { locale, lang }: { locale: LocaleConfig; lang: string } = $props();

	let query = $state('');
	let open = $state(false);
	let mobileOpen = $state(false);
	let activeIndex = $state(0);
	let inputEl = $state<HTMLInputElement | null>(null);
	let mobileInputEl = $state<HTMLInputElement | null>(null);
	let rootEl = $state<HTMLDivElement | null>(null);
	let results = $state<SearchDoc[]>([]);
	let loading = $state(false);

	let pagefind: Pagefind | null = null;
	let pagefindLoad: Promise<Pagefind | null> | null = null;
	let pagefindLang: string | null = null;
	let searchVersion = 0;
	let warnedMissingPagefind = false;
	let warnedSearchError = false;

	$effect(() => {
		const trimmed = query.trim();
		const currentLang = lang;

		activeIndex = 0;

		if (!trimmed) {
			searchVersion += 1;
			results = [];
			loading = false;
			return;
		}

		void searchDocs(trimmed, currentLang);
	});

	onMount(() => {
		void ensurePagefind(lang);
	});

	afterNavigate(() => {
		closeAll();
	});

	function closeAll() {
		open = false;
		mobileOpen = false;
		query = '';
		results = [];
		loading = false;
		activeIndex = 0;
		searchVersion += 1;
	}

	function openMobile() {
		mobileOpen = true;
		queueMicrotask(() => mobileInputEl?.focus());
	}

	function onInput() {
		open = query.trim().length > 0;
	}

	async function goToResult(doc: SearchDoc) {
		closeAll();
		await goto(doc.href);
	}

	function onKeydown(event: KeyboardEvent, docs: SearchDoc[]) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeAll();
			inputEl?.blur();
			mobileInputEl?.blur();
			return;
		}

		if (!docs.length) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			activeIndex = (activeIndex + 1) % docs.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = (activeIndex - 1 + docs.length) % docs.length;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			const target = docs[activeIndex];
			if (target) void goToResult(target);
		}
	}

	function searchOptions(currentLang: string): PagefindSearchOptions {
		return {
			filters: {
				lang: currentLang
			}
		};
	}

	function isCjk(char: string): boolean {
		return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Thai}]/u.test(
			char
		);
	}

	function pushCjkTokens(tokens: string[], value: string) {
		if (!value) return;

		const chars = Array.from(value);
		for (let index = 0; index < chars.length; index += 2) {
			tokens.push(chars.slice(index, index + 2).join(''));
		}
	}

	function normalizeSearchQuery(value: string): string {
		const tokens: string[] = [];
		let cjkBuffer = '';
		let wordBuffer = '';

		function flushCjk() {
			pushCjkTokens(tokens, cjkBuffer);
			cjkBuffer = '';
		}

		function flushWord() {
			const word = wordBuffer.trim();
			if (word) tokens.push(word);
			wordBuffer = '';
		}

		for (const char of value.trim()) {
			if (isCjk(char)) {
				flushWord();
				cjkBuffer += char;
			} else if (/\s/.test(char)) {
				flushCjk();
				flushWord();
			} else {
				flushCjk();
				wordBuffer += char;
			}
		}

		flushCjk();
		flushWord();

		return tokens.join(' ');
	}

	async function loadPagefind(): Promise<Pagefind | null> {
		if (pagefind) return pagefind;

		// @ts-expect-error Pagefind writes this bundle after the SvelteKit build.
		pagefindLoad ??= import(/* @vite-ignore */ '/pagefind/pagefind.js')
			.then((mod) => {
				pagefind = mod as Pagefind;
				return pagefind;
			})
			.catch((error) => {
				if (!warnedMissingPagefind) {
					warnedMissingPagefind = true;
					console.warn(
						'Pagefind search bundle is not available. Run a production build first.',
						error
					);
				}
				return null;
			});

		return pagefindLoad;
	}

	async function ensurePagefind(currentLang: string): Promise<Pagefind | null> {
		const pf = await loadPagefind();
		if (!pf) return null;

		if (pagefindLang !== currentLang) {
			document.documentElement.lang = currentLang;

			if (pagefindLang && pf.destroy) {
				await pf.destroy();
			}

			await pf.init();
			pagefindLang = currentLang;
		}

		return pf;
	}

	function toSearchDoc(result: PagefindSearchData): SearchDoc | null {
		const subResult = result.sub_results?.[0];
		const href = subResult?.url || result.url;
		if (!href) return null;

		const pageTitle = result.meta?.title || result.url;
		const title =
			subResult?.title && subResult.title !== pageTitle
				? `${pageTitle} / ${subResult.title}`
				: pageTitle;

		return {
			href,
			title,
			description: '',
			excerpt: subResult?.plain_excerpt || result.plain_excerpt || ''
		};
	}

	async function searchDocs(trimmed: string, currentLang: string) {
		const version = ++searchVersion;
		loading = true;

		try {
			const pf = await ensurePagefind(currentLang);
			if (!pf || version !== searchVersion) return;

			const options = searchOptions(currentLang);
			const pagefindQuery = normalizeSearchQuery(trimmed);
			pf.preload?.(pagefindQuery, options);

			const search = pf.debouncedSearch
				? await pf.debouncedSearch(pagefindQuery, options, 150)
				: await pf.search(pagefindQuery, options);

			if (!search || version !== searchVersion) return;

			const data = await Promise.all(search.results.slice(0, 8).map((result) => result.data()));
			if (version !== searchVersion) return;

			results = data.map(toSearchDoc).filter((result): result is SearchDoc => Boolean(result));
		} catch (error) {
			if (!warnedSearchError) {
				warnedSearchError = true;
				console.warn('Pagefind search failed.', error);
			}

			if (version === searchVersion) {
				results = [];
			}
		} finally {
			if (version === searchVersion) {
				loading = false;
			}
		}
	}

	function onDocumentPointerDown(event: PointerEvent) {
		if (!rootEl) return;
		if (!rootEl.contains(event.target as Node)) {
			open = false;
			if (!mobileOpen) query = '';
		}
	}

	function onGlobalKeydown(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			if (window.matchMedia('(min-width: 768px)').matches) {
				inputEl?.focus();
				open = query.trim().length > 0;
			} else {
				openMobile();
			}
		}
	}
</script>

<svelte:window onpointerdown={onDocumentPointerDown} onkeydown={onGlobalKeydown} />

<div class="relative" bind:this={rootEl}>
	<!-- Desktop search -->
	<div class="relative hidden md:block">
		<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ios-gray">
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
		</div>
		<input
			bind:this={inputEl}
			bind:value={query}
			type="search"
			autocomplete="off"
			autocorrect="off"
			spellcheck="false"
			role="combobox"
			aria-expanded={open && (results.length > 0 || loading)}
			aria-controls="docs-search-results"
			aria-autocomplete="list"
			class="block w-64 rounded-xl border-0 bg-ios-fill py-1.5 pr-12 pl-9 text-ios-label transition-colors outline-none placeholder:text-ios-gray focus:bg-ios-fill2 sm:text-sm sm:leading-6"
			placeholder={locale.ui.searchPlaceholder}
			oninput={onInput}
			onfocus={onInput}
			onkeydown={(e) => onKeydown(e, results)}
		/>
		<kbd
			class="pointer-events-none absolute inset-y-0 right-2 my-auto hidden h-5 items-center rounded border border-ios-separator bg-ios-card px-1.5 font-sans text-[10px] font-medium text-ios-gray sm:flex"
		>
			⌘K
		</kbd>

		{#if open && query.trim()}
			<div
				id="docs-search-results"
				class="absolute top-full right-0 left-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-ios-separator bg-ios-card py-2"
				role="listbox"
			>
				{#if results.length > 0}
					{#each results as doc, i}
						<a
							href={doc.href}
							role="option"
							aria-selected={i === activeIndex}
							class="block px-3 py-2.5 transition-colors {i === activeIndex
								? 'bg-ios-blue/10 text-ios-blue'
								: 'text-ios-label hover:bg-ios-fill'}"
							onmouseenter={() => (activeIndex = i)}
							onclick={() => closeAll()}
						>
							<div class="text-sm font-medium">{doc.title}</div>
							{#if doc.excerpt}
								<div class="mt-0.5 line-clamp-2 text-xs text-ios-secondary">
									{doc.excerpt}
								</div>
							{:else if doc.description}
								<div class="mt-0.5 line-clamp-1 text-xs text-ios-secondary">{doc.description}</div>
							{/if}
						</a>
					{/each}
				{:else if loading}
					<div class="px-3 py-3 text-sm text-ios-secondary">
						{locale.ui.searchLoading || 'Searching...'}
					</div>
				{:else}
					<div class="px-3 py-3 text-sm text-ios-secondary">{locale.ui.searchNoResults}</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Mobile search trigger -->
	<button
		type="button"
		class="rounded-full p-1.5 text-ios-secondary transition-colors hover:bg-ios-fill md:hidden"
		aria-label={locale.ui.search}
		onclick={openMobile}
	>
		<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
			/>
		</svg>
	</button>

	<!-- Mobile full-screen search -->
	{#if mobileOpen}
		<div class="fixed inset-0 z-[60] flex flex-col bg-ios-bg md:hidden">
			<div class="flex items-center gap-2 border-b border-ios-separator px-3 py-3">
				<div class="relative min-w-0 flex-1">
					<div
						class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ios-gray"
					>
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
					<input
						bind:this={mobileInputEl}
						bind:value={query}
						type="search"
						autocomplete="off"
						autocorrect="off"
						spellcheck="false"
						class="block w-full rounded-xl border-0 bg-ios-fill py-2.5 pr-3 pl-9 text-ios-label outline-none placeholder:text-ios-gray focus:bg-ios-fill2 sm:text-sm"
						placeholder={locale.ui.searchPlaceholder}
						onkeydown={(e) => onKeydown(e, results)}
					/>
				</div>
				<button
					type="button"
					class="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-ios-blue"
					onclick={closeAll}
				>
					{locale.ui.searchCancel}
				</button>
			</div>

			<div class="flex-1 overflow-y-auto p-2">
				{#if query.trim()}
					{#if results.length > 0}
						{#each results as doc, i}
							<a
								href={doc.href}
								class="block rounded-xl px-3 py-3 transition-colors {i === activeIndex
									? 'bg-ios-blue/10 text-ios-blue'
									: 'text-ios-label hover:bg-ios-fill'}"
								onclick={() => closeAll()}
							>
								<div class="text-sm font-medium">{doc.title}</div>
								{#if doc.excerpt}
									<div class="mt-0.5 line-clamp-2 text-xs text-ios-secondary">
										{doc.excerpt}
									</div>
								{:else if doc.description}
									<div class="mt-0.5 text-xs text-ios-secondary">{doc.description}</div>
								{/if}
							</a>
						{/each}
					{:else if loading}
						<div class="px-3 py-6 text-center text-sm text-ios-secondary">
							{locale.ui.searchLoading || 'Searching...'}
						</div>
					{:else}
						<div class="px-3 py-6 text-center text-sm text-ios-secondary">
							{locale.ui.searchNoResults}
						</div>
					{/if}
				{/if}
			</div>
		</div>
	{/if}
</div>
