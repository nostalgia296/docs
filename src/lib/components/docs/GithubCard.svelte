<script lang="ts">
	import { Star, GitFork, ExternalLink } from '@lucide/svelte';

	interface RepoData {
		full_name: string;
		html_url: string;
		description: string | null;
		language: string | null;
		stargazers_count: number;
		forks_count: number;
		owner: {
			avatar_url: string;
		};
	}

	let { repo }: { repo: string } = $props();

	let data = $state<RepoData | null>(null);
	let loading = $state(true);
	let failed = $state(false);

	// Approximate GitHub language colors; unknown languages fall back to a neutral tone.
	const LANGUAGE_COLORS: Record<string, string> = {
		JavaScript: '#f1e05a',
		TypeScript: '#3178c6',
		Python: '#3572a5',
		Go: '#00add8',
		Rust: '#dea584',
		C: '#555555',
		'C++': '#f34b7d',
		'C#': '#178600',
		Shell: '#89e051',
		HTML: '#e34c26',
		CSS: '#663399',
		Java: '#b07219',
		Kotlin: '#a97bff',
		Swift: '#f05138',
		Dart: '#00b4ab',
		Vue: '#41b883',
		Svelte: '#ff3e00',
		Ruby: '#701516',
		PHP: '#4f5d95',
		Zig: '#ec915c',
		Lua: '#000080',
		Nix: '#7e7eff',
		Dockerfile: '#384d54',
		Makefile: '#427819',
		Markdown: '#083fa1',
		SCSS: '#c6538c',
		Less: '#1d365d',
		ObjectiveC: '#438eff'
	};

	$effect(() => {
		let cancelled = false;
		loading = true;
		failed = false;
		data = null;

		fetch(`https://api.github.com/repos/${repo}`, {
			headers: { Accept: 'application/vnd.github+json' }
		})
			.then((res) => {
				if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
				return res.json();
			})
			.then((json) => {
				if (!cancelled) {
					data = json;
					loading = false;
				}
			})
			.catch(() => {
				if (!cancelled) {
					failed = true;
					loading = false;
				}
			});

		return () => {
			cancelled = true;
		};
	});

	function formatCount(n: number): string {
		if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
		if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
		return String(n);
	}

	const href = $derived(data?.html_url ?? `https://github.com/${repo}`);
	const languageColor = $derived(
		data?.language ? (LANGUAGE_COLORS[data.language] ?? null) : null
	);
</script>

<a
	{href}
	target="_blank"
	rel="noopener noreferrer"
	class="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-ios-separator bg-ios-card p-4 shadow-sm transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-ios-blue/40 sm:gap-3.5 sm:p-5"
>
	<!-- Hover sheen -->
	<span
		class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-ios-blue/8 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
	></span>

	{#if loading}
		<!-- Skeleton -->
		<div class="flex items-center gap-3">
			<div class="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-ios-fill2"></div>
			<div class="min-w-0 flex-1 space-y-2">
				<div class="h-2.5 w-16 animate-pulse rounded bg-ios-fill2"></div>
				<div class="h-4 w-40 animate-pulse rounded bg-ios-fill2"></div>
			</div>
		</div>
		<div class="h-3 w-full animate-pulse rounded bg-ios-fill2"></div>
		<div class="h-3 w-2/3 animate-pulse rounded bg-ios-fill2"></div>
		<div class="flex items-center gap-5">
			<div class="h-3 w-20 animate-pulse rounded bg-ios-fill2"></div>
			<div class="h-3 w-12 animate-pulse rounded bg-ios-fill2"></div>
		</div>
	{:else}
		<!-- Header: avatar + name -->
		<div class="flex items-start gap-3">
			{#if data}
				<img
					src={data.owner.avatar_url}
					alt=""
					loading="lazy"
					class="h-11 w-11 shrink-0 rounded-xl border border-ios-separator bg-ios-fill object-cover"
				/>
			{:else}
				<!-- Fallback avatar: GitHub mark -->
				<div
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ios-separator bg-ios-fill text-ios-gray"
				>
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"
						><path
							fill-rule="evenodd"
							d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
							clip-rule="evenodd"
						/></svg
					>
				</div>
			{/if}

			<div class="min-w-0 flex-1">
				<span
					class="font-mono text-[10px] font-medium tracking-[0.2em] text-ios-gray uppercase transition-colors duration-300 group-hover:text-ios-blue"
				>
					GitHub
				</span>
				<p
					class="mt-0.5 truncate text-sm font-semibold text-ios-label transition-colors duration-300 group-hover:text-ios-blue sm:text-[15px]"
				>
					{data?.full_name ?? repo}
				</p>
			</div>

			<ExternalLink
				class="mt-1 h-4 w-4 shrink-0 text-ios-gray transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ios-blue"
				strokeWidth={2}
			/>
		</div>

		<!-- Description -->
		{#if data?.description}
			<p
				class="line-clamp-2 text-sm leading-6 text-ios-secondary transition-colors duration-300 group-hover:text-ios-label/90"
			>
				{data.description}
			</p>
		{:else if failed}
			<p class="text-sm leading-6 text-ios-gray">Failed to load repository data.</p>
		{/if}

		<!-- Stats -->
		<div class="flex items-center gap-5 text-xs text-ios-secondary">
			{#if data}
				{#if data.language}
					<span class="inline-flex items-center gap-1.5 font-medium">
						<span
							class="h-2.5 w-2.5 rounded-full"
							style="background: {languageColor ?? 'var(--color-ios-gray)'}"
						></span>
						{data.language}
					</span>
				{/if}
				<span class="inline-flex items-center gap-1.5">
					<Star class="h-3.5 w-3.5 text-ios-gray" strokeWidth={2} />
					{formatCount(data.stargazers_count)}
				</span>
				<span class="inline-flex items-center gap-1.5">
					<GitFork class="h-3.5 w-3.5 text-ios-gray" strokeWidth={2} />
					{formatCount(data.forks_count)}
				</span>
			{:else if failed}
				<span class="text-ios-gray">{repo}</span>
			{/if}
		</div>
	{/if}
</a>
