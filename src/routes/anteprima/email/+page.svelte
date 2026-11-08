<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let selected = $state(0);
	const current = $derived(data.emails[selected]);
</script>

<svelte:head><title>Anteprima email · Secret Santa</title></svelte:head>

<main class="container wrap">
	<h1>Anteprima email</h1>
	<div class="tabs" role="tablist">
		{#each data.emails as e, i (i)}
			<button
				type="button"
				role="tab"
				aria-selected={selected === i}
				class:active={selected === i}
				onclick={() => (selected = i)}>{e.subject}</button
			>
		{/each}
	</div>
	<p class="meta"><strong>A:</strong> {current.to} · <strong>Oggetto:</strong> {current.subject}</p>
	<iframe title="Email: {current.subject}" srcdoc={current.html}></iframe>
</main>

<style>
	.wrap {
		padding-block: 32px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	h1 {
		color: var(--pine);
	}
	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.tabs button {
		min-height: 44px;
		padding: 0 14px;
		border: 1.5px solid var(--sand);
		border-radius: 999px;
		background: #fff;
		font: inherit;
		cursor: pointer;
	}
	.tabs button.active {
		background: var(--pine);
		border-color: var(--pine);
		color: var(--cream);
	}
	.meta {
		margin: 0;
		font-size: 14px;
	}
	iframe {
		width: 100%;
		height: 760px;
		border: 0;
		border-radius: var(--radius-lg);
		background: #efe6d6;
	}
</style>
