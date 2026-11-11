<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { Messages } from '#lib/i18n/index.ts';

	type Clip = { src: string; poster: string | null };

	/**
	 * Video di benvenuto a tutto schermo: parte quando si apre l'invito (la prima volta su questo
	 * dispositivo), poi sfuma e lascia la pagina. Su telefono usa il video verticale se c'è.
	 * Si salta con "Salta", Esc o alla fine del video. Con "riduci movimento" non parte da solo.
	 */
	let {
		desktop,
		mobile = null,
		t,
		storageKey,
		open = $bindable(false),
		soundtrack = null
	}: {
		desktop: Clip | null;
		mobile?: Clip | null;
		t: Messages['invite'];
		storageKey: string;
		open?: boolean;
		/** Colonna sonora esterna (Spotify): il video resta muto e il pulsante audio comanda lei. */
		soundtrack?: { playing: boolean; toggle: () => void } | null;
	} = $props();

	let clip = $state<Clip | null>(null);
	let video = $state<HTMLVideoElement>();
	let skipButton = $state<HTMLButtonElement>();
	let muted = $state(true);
	let fit = $state(false);
	let opener: Element | null = null;

	const MAX_ZOOM = 1.6;
	const soundMuted = $derived(soundtrack ? !soundtrack.playing : muted);

	function pickClip(): Clip | null {
		const small = matchMedia('(max-width: 720px), (orientation: portrait) and (max-width: 1024px)');
		return (small.matches && mobile) || desktop || mobile;
	}

	function seen() {
		try {
			return localStorage.getItem(storageKey) === '1';
		} catch {
			return false;
		}
	}

	function remember() {
		try {
			localStorage.setItem(storageKey, '1');
		} catch {
			/* storage non disponibile: pazienza, il video ripartirà */
		}
	}

	onMount(() => {
		clip = pickClip();
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (clip && !reduce && !seen()) open = true;
	});

	$effect(() => {
		if (open) {
			clip = pickClip();
			opener = document.activeElement;
			document.documentElement.style.overflow = 'hidden';
			tick().then(start);
		} else {
			document.documentElement.style.overflow = '';
		}
	});

	async function start() {
		skipButton?.focus();
		if (!video) return;
		video.currentTime = 0;
		if (soundtrack) {
			video.muted = true;
			video.play().catch(close);
			return;
		}
		// Prima prova con l'audio (alcuni browser lo permettono), altrimenti muto.
		video.muted = false;
		try {
			await video.play();
			muted = false;
		} catch {
			video.muted = true;
			muted = true;
			video.play().catch(close);
		}
	}

	function updateFit() {
		if (!video?.videoWidth) return;
		const videoRatio = video.videoWidth / video.videoHeight;
		const screenRatio = innerWidth / innerHeight;
		fit = Math.max(videoRatio / screenRatio, screenRatio / videoRatio) > MAX_ZOOM;
	}

	function toggleSound() {
		if (soundtrack) return soundtrack.toggle();
		if (!video) return;
		video.muted = !video.muted;
		muted = video.muted;
		if (video.paused) video.play().catch(() => {});
	}

	function close() {
		if (!open) return;
		video?.pause();
		remember();
		open = false;
		(opener as HTMLElement | null)?.focus?.();
	}

	function onKey(e: KeyboardEvent) {
		if (open && e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={onKey} onresize={updateFit} />

{#if open && clip}
	<div
		class="intro"
		class:fit
		role="dialog"
		aria-modal="true"
		aria-label={t.introLabel}
		transition:fade={{ duration: 500 }}
	>
		{#if clip.poster}<img class="blur" src={clip.poster} alt="" />{/if}
		<video
			bind:this={video}
			src={clip.src}
			poster={clip.poster ?? undefined}
			playsinline
			preload="auto"
			disablepictureinpicture
			onloadedmetadata={updateFit}
			onended={close}
			onerror={close}
		>
			<track kind="captions" />
		</video>

		<button bind:this={skipButton} type="button" class="pill skip" onclick={close}>
			{t.skipIntro}
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.4"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"><path d="M5 5l8 7-8 7M15 5v14" /></svg
			>
		</button>

		<button type="button" class="pill sound" aria-pressed={!soundMuted} onclick={toggleSound}>
			{#if soundMuted}
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M17 9l4 6M21 9l-4 6" /></svg
				>
				{t.soundOn}
			{:else}
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
					><path d="M4 9h4l5-4v14l-5-4H4z" /><path
						d="M17 8a5 5 0 0 1 0 8M19.5 5.5a9 9 0 0 1 0 13"
					/></svg
				>
				{t.soundOff}
			{/if}
		</button>
	</div>
{/if}

<style>
	.intro {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: #0b0b0b;
		overflow: hidden;
	}
	video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.fit video {
		object-fit: contain;
	}
	.blur {
		position: absolute;
		inset: -40px;
		width: calc(100% + 80px);
		height: calc(100% + 80px);
		object-fit: cover;
		filter: blur(30px) brightness(0.7);
		display: none;
	}
	.fit .blur {
		display: block;
	}
	.pill {
		position: absolute;
		z-index: 1;
		min-height: 44px;
		padding: 0 18px;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		border-radius: 999px;
		border: 1.5px solid rgba(255, 255, 255, 0.6);
		background: rgba(0, 0, 0, 0.4);
		color: #fff;
		font: inherit;
		font-size: 15px;
		font-weight: 600;
		cursor: pointer;
		backdrop-filter: blur(6px);
	}
	.pill:hover {
		background: rgba(0, 0, 0, 0.6);
	}
	.pill:focus-visible {
		outline: 3px solid var(--gold);
		outline-offset: 2px;
	}
	.skip {
		top: max(20px, env(safe-area-inset-top));
		right: 20px;
	}
	.sound {
		bottom: max(24px, env(safe-area-inset-bottom));
		left: 20px;
	}
</style>
