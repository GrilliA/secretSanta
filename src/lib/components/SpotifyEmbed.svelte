<script lang="ts">
	import { spotifyEmbedUrl } from '#lib/spotify.ts';

	/** Player ufficiale di Spotify (iframe). `value` è "tipo/id" da `parseSpotify`. */
	let {
		value,
		title,
		compact = true
	}: { value: string; title: string; compact?: boolean } = $props();
</script>

<iframe
	class="spotify"
	src={spotifyEmbedUrl(value)}
	{title}
	width="100%"
	height={compact ? 152 : 352}
	frameborder="0"
	allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
	loading="lazy"
></iframe>

<style>
	.spotify {
		display: block;
		width: 100%;
		border: 0;
		border-radius: 12px;
		background: rgb(0 0 0 / 0.15);
	}
</style>
