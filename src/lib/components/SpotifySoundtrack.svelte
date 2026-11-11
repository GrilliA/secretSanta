<script lang="ts" module>
	/** Pezzi dell'iFrame API di Spotify che usiamo (https://developer.spotify.com/documentation/embeds). */
	export type SpotifyController = {
		play(): void;
		pause(): void;
		resume(): void;
		addListener(
			event: 'ready' | 'playback_update',
			cb: (e: { data: { isPaused: boolean; isBuffering?: boolean; position?: number } }) => void
		): void;
		destroy?(): void;
	};
	type SpotifyApi = {
		createController(
			el: HTMLElement,
			options: { uri: string; width?: string | number; height?: string | number },
			cb: (controller: SpotifyController) => void
		): void;
	};
	type SpotifyWindow = Window & {
		onSpotifyIframeApiReady?: (api: SpotifyApi) => void;
		__spotifyApi?: Promise<SpotifyApi>;
	};

	/** Carica una sola volta lo script ufficiale e restituisce l'API. */
	function loadApi(): Promise<SpotifyApi> {
		const w = window as SpotifyWindow;
		w.__spotifyApi ??= new Promise((resolve, reject) => {
			w.onSpotifyIframeApiReady = resolve;
			const s = document.createElement('script');
			s.src = 'https://open.spotify.com/embed/iframe-api/v1';
			s.async = true;
			s.onerror = reject;
			document.head.append(s);
		});
		return w.__spotifyApi;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { Messages } from '#lib/i18n/index.ts';

	/**
	 * Colonna sonora da Spotify: player ufficiale nella pagina + pulsante fisso per accenderla/spegnerla.
	 * Prova a partire subito (insieme al video di benvenuto); se il browser lo blocca parte al primo
	 * tocco sulla pagina. Se la persona la spegne, la scelta resta salvata su questo dispositivo.
	 */
	let {
		value,
		title,
		t,
		playing = $bindable(false)
	}: {
		value: string;
		title: string;
		t: Messages['invite'];
		playing?: boolean;
	} = $props();

	const OFF_KEY = 'music:off';

	let host = $state<HTMLElement>();
	let controller: SpotifyController | null = null;
	let started = false;
	let off = false;
	let failed = $state(false);

	function readOff() {
		try {
			return localStorage.getItem(OFF_KEY) === '1';
		} catch {
			return false;
		}
	}
	function writeOff(v: boolean) {
		try {
			if (v) localStorage.setItem(OFF_KEY, '1');
			else localStorage.removeItem(OFF_KEY);
		} catch {
			/* pazienza */
		}
	}

	function play() {
		if (!controller) return;
		if (started) controller.resume();
		else controller.play();
	}

	/** Accende/spegne (usato dal pulsante fisso e dal pulsante audio del video). */
	export function toggle() {
		removeGesture();
		if (playing) {
			controller?.pause();
			off = true;
			writeOff(true);
		} else {
			off = false;
			writeOff(false);
			play();
		}
	}

	let waiting = false;
	function onGesture(e: Event) {
		// Il pulsante della musica e quello dell'audio del video gestiscono da soli.
		if ((e.target as Element | null)?.closest?.('.music-toggle, .intro .sound')) return;
		removeGesture();
		if (!off && !playing) play();
	}
	function addGesture() {
		if (waiting) return;
		waiting = true;
		window.addEventListener('pointerdown', onGesture, { capture: true });
		window.addEventListener('keydown', onGesture, { capture: true });
	}
	function removeGesture() {
		waiting = false;
		window.removeEventListener('pointerdown', onGesture, { capture: true });
		window.removeEventListener('keydown', onGesture, { capture: true });
	}

	onMount(() => {
		off = readOff();
		let alive = true;
		loadApi()
			.then((api) => {
				if (!alive || !host) return;
				const [type, id] = value.split('/');
				// Spotify sostituisce l'elemento con il suo iframe: gli si passa un figlio creato qui.
				const el = document.createElement('div');
				// Nodo creato fuori da Svelte e ceduto a Spotify: Svelte non lo gestisce.
				// eslint-disable-next-line svelte/no-dom-manipulating
				host.append(el);
				api.createController(
					el,
					{ uri: `spotify:${type}:${id}`, width: '100%', height: 152 },
					(c) => {
						controller = c;
						c.addListener('playback_update', (e) => {
							playing = !e.data.isPaused;
							if (playing) {
								started = true;
								removeGesture();
							}
						});
						c.addListener('ready', () => {
							if (off) return;
							play();
							// Se dopo un attimo non suona, il browser ha bloccato l'autoplay: si aspetta un tocco.
							setTimeout(() => {
								if (!playing && !off) addGesture();
							}, 1500);
						});
					}
				);
			})
			.catch(() => (failed = true));
		return () => {
			alive = false;
			removeGesture();
			controller?.destroy?.();
		};
	});
</script>

<div class="frame">
	<div bind:this={host} aria-label={title}></div>
	{#if failed}
		<iframe
			src="https://open.spotify.com/embed/{value}?utm_source=generator"
			{title}
			width="100%"
			height="152"
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			loading="lazy"
		></iframe>
	{/if}
</div>

{#if !failed}
	<button
		type="button"
		class="music-toggle"
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
{/if}

<style>
	.frame {
		min-height: 152px;
		border-radius: 12px;
		overflow: hidden;
		background: rgb(0 0 0 / 0.15);
	}
	.frame :global(iframe) {
		display: block;
		width: 100%;
		border: 0;
		border-radius: 12px;
	}
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
