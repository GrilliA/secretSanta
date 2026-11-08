<script lang="ts">
	/** Foto rotonda del partecipante, o la sua iniziale se non c'è la foto. */
	let {
		name,
		photoId = null,
		src = null,
		size = 40,
		tone = 'cream',
		alt = null
	}: {
		name: string;
		photoId?: string | null;
		/** URL alternativo (es. anteprima locale prima dell'upload). */
		src?: string | null;
		size?: number;
		tone?: 'cream' | 'pine' | 'holly';
		/** Testo alternativo della foto (tradotto dalla pagina). */
		alt?: string | null;
	} = $props();

	const url = $derived(src ?? (photoId ? `/foto/${photoId}` : null));
</script>

<span
	class="avatar {tone}"
	style:width="{size}px"
	style:height="{size}px"
	style:font-size="{Math.round(size * 0.4)}px"
>
	{#if url}
		<img src={url} alt={alt ?? name} width={size} height={size} loading="lazy" />
	{:else}
		<span aria-hidden="true">{name.trim()[0]?.toUpperCase() ?? '?'}</span>
	{/if}
</span>

<style>
	.avatar {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		overflow: hidden;
		font-weight: 600;
		background: var(--cream-200);
		color: var(--pine);
	}
	.pine {
		background: var(--pine);
		color: var(--gold-300);
	}
	.holly {
		background: var(--holly);
		color: #fff;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
</style>
