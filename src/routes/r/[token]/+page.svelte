<script lang="ts">
	import { untrack } from 'svelte';
	import Baubles from '#lib/components/Baubles.svelte';
	import Envelope from '#lib/components/Envelope.svelte';
	import GiftIcon from '#lib/components/GiftIcon.svelte';
	import Hills from '#lib/components/Hills.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let phase = $state<'closed' | 'opening' | 'revealed'>('closed');
	let myWishes = $state<string[]>(untrack(() => [...data.me.wishes]));
	let newWish = $state('');

	function addWish(e: SubmitEvent) {
		e.preventDefault();
		const w = newWish.trim();
		if (!w) return;
		// TODO: salvare il desiderio sul server.
		myWishes.push(w);
		newWish = '';
	}
</script>

<svelte:head><title>Il tuo Secret Santa · {data.event.name}</title></svelte:head>

<div class="page">
	<section class="hero snow" class:tall={phase !== 'revealed'}>
		<Baubles tone="pine" />
		<div class="container inner">
			<div class="top">
				<div class="brand"><GiftIcon size={28} color="var(--gold-300)" /> {data.event.name}</div>
				{#if data.managerName}
					<span class="pill">Stai vedendo l’invito di {data.me.name}</span>
				{/if}
			</div>

			{#if phase !== 'revealed'}
				<div class="closed">
					<span class="lead">{data.me.name}, c’è una busta per te</span>
					<Envelope opening={phase === 'opening'} onopened={() => (phase = 'revealed')} />
					<button
						class="btn btn-cream"
						type="button"
						disabled={phase === 'opening'}
						onclick={() => (phase = 'opening')}>Apri la busta</button
					>
				</div>
			{:else}
				<div class="reveal" aria-live="polite">
					<span class="lead fadein">Ciao {data.me.name}, quest’anno fai il regalo a…</span>
					<h1 class="fadein late">{data.receiver.name}</h1>
					<div class="facts fadein late">
						{#if data.event.budget}<span>Budget {data.event.budget}</span>{/if}
						{#if data.event.exchangeDate}<span>Scambio il {data.event.exchangeDate}</span>{/if}
						<button type="button" class="replay" onclick={() => (phase = 'closed')}>
							Riapri la busta
						</button>
					</div>
					<svg class="spark s1" viewBox="0 0 24 24" aria-hidden="true"
						><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" /></svg
					>
					<svg class="spark s2" viewBox="0 0 24 24" aria-hidden="true"
						><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" /></svg
					>
					<svg class="spark s3" viewBox="0 0 24 24" aria-hidden="true"
						><path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" /></svg
					>
				</div>
			{/if}
		</div>
		<Hills height={80} />
	</section>

	{#if phase === 'revealed'}
		<main class="container lists fadein late">
			<section class="card">
				<h2>I desideri di {data.receiver.name}</h2>
				{#if data.receiver.wishes.length}
					<ul class="wishes">
						{#each data.receiver.wishes as w (w)}
							<li>
								<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"
									><path
										d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"
										fill="var(--gold)"
										stroke="var(--gold-700)"
										stroke-width="1.5"
										stroke-linejoin="round"
									/></svg
								>
								{w}
							</li>
						{/each}
					</ul>
				{:else}
					<p class="muted">Non ha ancora scritto la sua lista. Ripassa più tardi!</p>
				{/if}
			</section>

			<section class="card">
				<h2>{data.managerName ? `La lista di ${data.me.name}` : 'La tua lista dei desideri'}</h2>
				<p class="muted">
					{data.managerName
						? `La vede solo chi fa il regalo a ${data.me.name}. La compili tu per conto suo.`
						: 'La vede solo chi ti fa il regalo.'}
				</p>
				{#if myWishes.length}
					<ul class="wishes">
						{#each myWishes as w, i (i)}<li>{w}</li>{/each}
					</ul>
				{/if}
				<form class="wish-form" onsubmit={addWish}>
					<label class="sr-only" for="wish">Aggiungi un desiderio</label>
					<input
						id="wish"
						class="input"
						placeholder="Aggiungi un desiderio…"
						bind:value={newWish}
					/>
					<button class="btn btn-pine" type="submit">Aggiungi</button>
				</form>
				<p class="secret">Shh… è un segreto: non dirlo a {data.receiver.name}!</p>
			</section>
		</main>
	{/if}
</div>

<style>
	.page {
		min-height: 100dvh;
		background: var(--cream);
	}
	.hero {
		position: relative;
		overflow: hidden;
		background-color: var(--holly-700);
		color: var(--cream);
	}
	.hero.tall {
		min-height: 640px;
	}
	.inner {
		position: relative;
		padding-block: 24px 120px;
		display: flex;
		flex-direction: column;
		gap: 40px;
	}
	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 20px;
	}
	.pill {
		padding: 6px 12px;
		border-radius: 999px;
		background: var(--holly-800);
		font-size: 13px;
	}
	.lead {
		font-family: var(--font-display);
		font-style: italic;
		font-weight: 600;
		font-size: clamp(20px, 2.4vw, 28px);
		color: var(--gold-300);
	}
	.closed {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 28px;
		text-align: center;
	}
	.closed :global(.env) {
		margin-top: 120px;
	}
	.btn:disabled {
		opacity: 0.6;
		cursor: default;
	}
	.reveal {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	h1 {
		font-size: clamp(64px, 10vw, 128px);
		line-height: 0.95;
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		margin-top: 8px;
	}
	.facts span {
		padding: 8px 14px;
		border-radius: 999px;
		border: 1.5px solid var(--gold);
		font-size: 14px;
		font-weight: 500;
	}
	.replay {
		height: 44px;
		padding: 0 14px;
		border: 0;
		background: transparent;
		color: #f6dcd8;
		font: inherit;
		font-size: 14px;
		text-decoration: underline;
		cursor: pointer;
	}
	.spark {
		position: absolute;
		animation: spark 1.2s ease-out both;
	}
	.s1 {
		width: 40px;
		left: min(340px, 70%);
		top: 30px;
		fill: var(--gold-300);
	}
	.s2 {
		width: 24px;
		left: 20px;
		top: 150px;
		fill: var(--cream);
		animation-delay: 0.3s;
	}
	.s3 {
		width: 30px;
		left: min(520px, 85%);
		top: 120px;
		fill: var(--gold);
		animation-delay: 0.5s;
	}
	@keyframes spark {
		0% {
			opacity: 0;
			transform: scale(0.3) rotate(0);
		}
		40% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: scale(1.4) rotate(90deg);
		}
	}
	.fadein {
		animation: fadein 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
	}
	.late {
		animation-delay: 0.25s;
	}
	@keyframes fadein {
		from {
			opacity: 0;
			transform: translateY(18px) scale(0.97);
		}
	}
	.lists {
		padding-block: 8px 48px;
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		align-items: flex-start;
	}
	.lists .card {
		flex: 1 1 380px;
		min-width: 0;
		padding: 28px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	h2 {
		font-size: 24px;
		color: var(--pine);
	}
	.muted {
		margin: 0;
		font-size: 14px;
		color: var(--ink-muted);
	}
	.wishes {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.wishes li {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		background: var(--cream-200);
		border-radius: var(--radius-sm);
		font-size: 15px;
	}
	.wish-form {
		display: flex;
		gap: 10px;
	}
	.wish-form input {
		flex: 1;
		min-width: 0;
	}
	.wish-form .btn {
		height: 48px;
	}
	.secret {
		margin: 8px 0 0;
		padding: 14px 16px;
		background: var(--blush);
		border-radius: var(--radius-sm);
		font-size: 14px;
		color: var(--holly-700);
	}
</style>
