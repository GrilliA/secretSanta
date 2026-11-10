<script lang="ts">
	import { onMount } from 'svelte';

	/**
	 * Video di sfondo della pagina della busta: senza audio, in loop, sotto una velatura che
	 * mantiene leggibili i testi. Non parte con "riduci movimento" o "risparmio dati"
	 * (resta il fotogramma) e ha sempre un pulsante pausa/riproduci.
	 */
	let {
		src,
		poster = null,
		pauseLabel,
		playLabel
	}: { src: string; poster?: string | null; pauseLabel: string; playLabel: string } = $props();

	let video = $state<HTMLVideoElement>();
	let playing = $state(false);

	onMount(() => {
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
			?.saveData;
		if (!reduce && !saveData) play();
	});

	function play() {
		if (!video) return;
		video.muted = true;
		video.play().then(
			() => (playing = true),
			() => (playing = false)
		);
	}

	function toggle() {
		if (!video) return;
		if (playing) {
			video.pause();
			playing = false;
		} else play();
	}
</script>

<div class="backdrop" aria-hidden="true">
	<video
		bind:this={video}
		{src}
		poster={poster ?? undefined}
		muted
		loop
		playsinline
		preload="metadata"
		disablepictureinpicture
		disableremoteplayback
	></video>
	<div class="veil"></div>
	<div class="flakes snow"></div>
</div>

<button
	type="button"
	class="toggle"
	aria-label={playing ? pauseLabel : playLabel}
	aria-pressed={!playing}
	onclick={toggle}
>
	{#if playing}
		<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
			><rect x="6" y="5" width="4" height="14" rx="1" /><rect
				x="14"
				y="5"
				width="4"
				height="14"
				rx="1"
			/></svg
		>
	{:else}
		<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
			><path
				d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"
			/></svg
		>
	{/if}
</button>

<style>
	.backdrop {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	/* Velatura rossa: i testi chiari restano leggibili su qualsiasi video. */
	.veil {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(
				180deg,
				rgba(110, 18, 24, 0.55) 0%,
				rgba(110, 18, 24, 0.35) 45%,
				rgba(110, 18, 24, 0.75) 100%
			),
			radial-gradient(ellipse at 30% 40%, rgba(30, 10, 10, 0.25), transparent 70%);
	}
	.flakes {
		position: absolute;
		inset: 0;
		opacity: 0.6;
	}
	.toggle {
		position: absolute;
		right: 20px;
		bottom: 100px;
		z-index: 3;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1.5px solid rgba(255, 255, 255, 0.55);
		background: rgba(30, 10, 10, 0.35);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		backdrop-filter: blur(4px);
	}
	@media (max-width: 560px) {
		.toggle {
			bottom: 84px;
			right: 14px;
		}
	}
	.toggle:hover {
		background: rgba(30, 10, 10, 0.55);
	}
</style>
