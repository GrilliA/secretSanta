<script lang="ts">
	import Avatar from './Avatar.svelte';
	import type { Messages } from '#lib/i18n/index.ts';

	/**
	 * "Chi gioca quest'anno": ogni partecipante è una pallina appesa a una ghirlanda.
	 * Mostra solo nome, foto e (prima dell'estrazione) se la lista è pronta.
	 */
	let {
		players,
		t,
		showReady = true
	}: {
		players: { name: string; photoId: string | null; ready: boolean; isMe: boolean }[];
		t: Messages['invite'];
		showReady?: boolean;
	} = $props();

	const ready = $derived(players.filter((p) => p.ready).length);
	const tones = ['holly', 'pine', 'cream'] as const;
</script>

<section class="garland card" aria-labelledby="players-title">
	<header>
		<h2 id="players-title">{t.playersTitle}</h2>
		<span class="count">
			{showReady ? t.playersReady(ready, players.length) : t.playersCount(players.length)}
		</span>
	</header>

	<ul>
		{#each players as p, i (i)}
			<li
				class:me={p.isMe}
				style:--i={i}
				style:--drop="{[14, 34, 22, 40, 18][i % 5]}px"
				style:--sway="{[1.6, -1.4, 1.2, -1.8, 1.4][i % 5]}deg"
			>
				<span class="thread" aria-hidden="true"></span>
				<span class="cap" aria-hidden="true"></span>
				<span class="ball">
					<Avatar
						name={p.name}
						photoId={p.photoId}
						size={76}
						tone={tones[i % tones.length]}
						alt={t.photoOf(p.name)}
					/>
					{#if showReady && p.ready}
						<span class="check" title={t.readyBadge}>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"><path d="M5 12l5 5L19 7" /></svg
							>
							<span class="sr-only">{t.readyBadge}</span>
						</span>
					{/if}
				</span>
				<span class="name">
					{p.name}
					{#if p.isMe}<span class="you">{t.you}</span>{/if}
				</span>
			</li>
		{/each}
	</ul>
</section>

<style>
	.garland {
		padding: 28px 28px 32px;
		overflow: hidden;
	}
	header {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 4px 16px;
		margin-bottom: 8px;
	}
	h2 {
		font-size: 24px;
		color: var(--pine);
	}
	.count {
		font-size: 14px;
		color: var(--ink-muted);
	}
	/* La ghirlanda: una corda dorata con lucine ripetuta in cima a ogni riga (righe alte 200px). */
	ul {
		--row: 190px;
		--col: 112px;
		margin: 0 -28px;
		padding: 0 20px;
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fit, var(--col));
		justify-content: center;
		grid-auto-rows: var(--row);
		background-image:
			radial-gradient(circle at 50% 9px, var(--holly) 0 3px, transparent 3.5px),
			radial-gradient(circle at 50% 9px, var(--gold-300) 0 3px, transparent 3.5px),
			linear-gradient(var(--gold) 0 2px, transparent 2px);
		background-size:
			56px var(--row),
			56px var(--row),
			100% var(--row);
		background-position:
			0 0,
			28px 0,
			0 6px;
	}
	@media (max-width: 480px) {
		ul {
			--col: 96px;
			--row: 176px;
			padding: 0 8px;
		}
		.name {
			font-size: 13px;
		}
	}
	li {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 7px;
		transform-origin: 50% 7px;
		animation:
			drop 0.7s calc(var(--i) * 80ms) cubic-bezier(0.2, 1.3, 0.4, 1) both,
			sway 5s calc(var(--i) * -0.7s) ease-in-out infinite alternate;
	}
	.thread {
		width: 1.5px;
		height: var(--drop);
		background: var(--gold-700);
	}
	.cap {
		width: 14px;
		height: 8px;
		border-radius: 2px 2px 0 0;
		background: linear-gradient(var(--gold-300), var(--gold-700));
	}
	.ball {
		position: relative;
		padding: 3px;
		border-radius: 50%;
		background: conic-gradient(
			var(--gold),
			var(--gold-300),
			var(--gold),
			var(--gold-700),
			var(--gold)
		);
		box-shadow: 0 8px 18px rgba(30, 26, 22, 0.18);
		transition: transform 0.25s ease;
	}
	.ball :global(.avatar) {
		font-family: var(--font-display);
		border: 2px solid #fff;
	}
	li:hover .ball {
		transform: scale(1.06);
	}
	.me .ball {
		background: conic-gradient(var(--holly), #e0565c, var(--holly), var(--holly-800), var(--holly));
	}
	.check {
		position: absolute;
		right: -2px;
		bottom: 2px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--pine);
		color: var(--gold-300);
		border: 2px solid #fff;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.name {
		margin-top: 8px;
		max-width: 100%;
		padding: 0 4px;
		text-align: center;
		font-size: 14px;
		font-weight: 600;
		line-height: 1.25;
		overflow-wrap: anywhere;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
	}
	.you {
		padding: 1px 8px;
		border-radius: 999px;
		background: var(--holly);
		color: #fff;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	@keyframes drop {
		from {
			opacity: 0;
			transform: translateY(-24px) rotate(0deg);
		}
	}
	@keyframes sway {
		from {
			rotate: calc(var(--sway) * -1);
		}
		to {
			rotate: var(--sway);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		li {
			animation: none;
		}
	}
</style>
