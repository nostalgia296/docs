<script lang="ts">
	import { onMount } from 'svelte';

	let { data } = $props();
	let Content = $derived(data.content);

	const successDuration = 1200;

	// Delegated click handler for the copy buttons injected into
	// expressive-code blocks (see src/lib/expressive-code/copy-button.ts).
	function handleCopyClick(event: MouseEvent) {
		const button = (event.target as Element | null)?.closest<HTMLButtonElement>('button.copy-btn');
		if (!button) return;

		const codeElement = button.closest('pre')?.querySelector('code');
		if (!codeElement) return;

		// Expressive Code renders each line as
		// <div class="ec-line"><div class="gutter">…</div><div class="code">…</div></div>.
		// Collecting only the .code parts skips the line-number gutter.
		const code = Array.from(codeElement.querySelectorAll('.code'))
			.map((el) => el.textContent)
			.map((text) => (text === '\n' ? '' : text))
			.join('\n');

		navigator.clipboard.writeText(code);

		const previousTimeout = button.dataset.timeoutId;
		if (previousTimeout) {
			window.clearTimeout(Number(previousTimeout));
		}

		button.classList.add('success');

		const timeoutId = window.setTimeout(() => {
			button.classList.remove('success');
		}, successDuration);

		button.dataset.timeoutId = String(timeoutId);
	}

	onMount(() => {
		document.addEventListener('click', handleCopyClick);
		return () => document.removeEventListener('click', handleCopyClick);
	});
</script>

<svelte:head>
	<title>{data.meta?.title || 'Documentation'}</title>
</svelte:head>

<!-- We render the compiled markdown component dynamically -->
<Content />
