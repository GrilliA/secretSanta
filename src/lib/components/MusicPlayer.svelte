<script lang="ts">
	import { onMount } from 'svelte';
	import type { Messages } from '#lib/i18n/index.ts';

	/**
	 * Musica di sottofondo dell'invito, con un pulsante fisso per accenderla/spegnerla.
	 * - Ferma mentre `paused` (es. durante il video di benvenuto).
	 * - Prova a partire da sola; se il browser lo blocca, parte al primo tocco sulla pagina.
	 * - Se la persona la spegne, la scelta resta salvata su questo dispositivo.
	 */
	let {
		src,
		t,
		paused = false
	}: {
		src: string;
		t: Messages['invite'];
		paused?: boolean;
	} = $props();

	const OFF_KEY = 'music:off';

	let audio = $state<HTMLAudioElement>();
	let playing = $state(false);
	let off = $state(false);
	let mounted = $state(false);

	function readOff() {
		try {
			return localStorage.getItem(OFF_KEY) === '1';
		} catch {
			return false;
		}
	}
	function writeOff(value: boolean) {
		try {
			if (value) localStorage.setItem(OFF_KEY, '1');
			else localStorage.removeItem(OFF_KEY);
		} catch {
			/* storage non disponibile: pazienza */
		}
	}

	let waitingForGesture = false;
	function onGesture(e: Event) {
		removeGesture();
		// Il tocco sul pulsante della musica lo gestisce il pulsante stesso.
		if ((e.target as Element | null)?.closest?.('.music-toggle')) return;
		if (!off && !paused) void start();
	}
	function addGesture() {
		if (waitingForGesture) return;
		waitingForGesture = true;
		window.addEventListener('pointerdown', onGesture, { capture: true });
		window.addEventListener('keydown', onGesture, { capture: true });
	}
	function removeGesture() {
		waitingForGesture = false;
		window.removeEventListener('pointerdown', onGesture, { capture: true });
		window.removeEventListener('keydown', onGesture, { capture: true });
	}

	async function start() {
		if (!audio) return;
		audio.volume = 0.6;
		try {
			await audio.play();
		} catch {
			// Autoplay bloccato: si aspetta il primo gesto della persona.
			addGesture();
		}
	}

	function toggle() {
		if (!audio) return;
		removeGesture();
		if (playing) {
			audio.pause();
			off = true;
			writeOff(true);
		} else {
			off = false;
			writeOff(false);
			void start();
		}
	}

	onMount(() => {
		off = readOff();
		mounted = true;
		return removeGesture;
	});

	// Parte quando non c'è niente davanti (video) e la persona non l'ha spenta.
	$effect(() => {
		if (!mounted || !audio) return;
		if (paused) {
			audio.pause();
			return;
		}
		if (off) return;
		const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
			?.saveData;
		if (saveData) return;
		const id = setTimeout(() => void start(), 0);
		return () => clearTimeout(id);
	});
</script>

<audio
	bind:this={audio}
	{src}
	loop
	preload="auto"
	onplay={() => (playing = true)}
	onpause={() => (playing = false)}
></audio>

<button
	type="button"
	class="music-toggle"
	class:playing
	aria-pressed={playing}
	aria-label={playing ? t.musicOff : t.musicOn}
	title={playing ? t.musicOff : t.musicOn}
	onclick={toggle}
>
	{#if playing}
		<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>
	{:else}
		<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M9 18V6l11-2v12"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<circle cx="6.5" cy="18" r="2.5" fill="currentColor" />
			<circle cx="17.5" cy="16" r="2.5" fill="currentColor" />
		</svg>
	{/if}
</button>

<style>
	.music-toggle {
		position: fixed;
		right: max(16px, env(safe-area-inset-right));
		bottom: max(16px, env(safe-area-inset-bottom));
		z-index: 50;
		display: grid;
		place-items: center;
		width: 52px;
		height: 52px;
		border: 2px solid var(--gold);
		border-radius: 50%;
		background: var(--pine);
		color: var(--gold-300);
		box-shadow: 0 6px 18px rgb(0 0 0 / 0.25);
		cursor: pointer;
		transition: transform 0.15s ease;
	}
	.music-toggle:hover {
		transform: scale(1.06);
	}
	.music-toggle:focus-visible {
		outline: 3px solid var(--gold);
		outline-offset: 3px;
	}
	.bars {
		display: flex;
		align-items: flex-end;
		gap: 3px;
		height: 18px;
	}
	.bars i {
		display: block;
		width: 4px;
		height: 100%;
		border-radius: 2px;
		background: currentColor;
		transform-origin: bottom;
		animation: eq 0.9s ease-in-out infinite;
	}
	.bars i:nth-child(2) {
		animation-delay: -0.3s;
	}
	.bars i:nth-child(3) {
		animation-delay: -0.6s;
	}
	@keyframes eq {
		0%,
		100% {
			transform: scaleY(0.35);
		}
		50% {
			transform: scaleY(1);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.bars i {
			animation: none;
			transform: scaleY(0.7);
		}
	}
</style>
