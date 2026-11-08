<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from '#lib/components/Avatar.svelte';
	import Baubles from '#lib/components/Baubles.svelte';
	import Envelope from '#lib/components/Envelope.svelte';
	import GiftIcon from '#lib/components/GiftIcon.svelte';
	import Hills from '#lib/components/Hills.svelte';
	import { formatDay } from '#lib/format.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let phase = $state<'closed' | 'opening' | 'revealed'>('closed');
	const day = $derived(formatDay(data.event.exchangeDate));
</script>

<svelte:head><title>Il tuo Secret Santa · {data.event.name}</title></svelte:head>

<div class="page">
	<section class="hero snow" class:tall={data.receiver && phase !== 'revealed'}>
		<Baubles tone="pine" />
		<div class="container inner">
			<div class="top">
				<div class="brand"><GiftIcon size={28} color="var(--gold-300)" /> {data.event.name}</div>
				{#if data.managerName}
					<span class="pill">Stai vedendo l’invito di {data.me.name}</span>
				{/if}
			</div>

			{#if !data.receiver}
				<div class="closed">
					<span class="lead">Ciao {data.me.name}!</span>
					{#if data.me.ready}
						<h1 class="wait">La tua lista è pronta. Ora si aspetta la busta!</h1>
						<p class="wait-text">
							Quando tutti avranno finito, {data.event.organizerName} farà l’estrazione e ti arriverà
							una mail per scoprire a chi fare il regalo. Puoi ancora modificare la lista qui sotto.
						</p>
					{:else}
						<h1 class="wait">Che cosa vorresti trovare sotto l’albero?</h1>
						<p class="wait-text">
							Scrivi qui sotto la tua lista dei desideri: la vedrà solo chi ti farà il regalo.
							Quando hai finito, premi “La mia lista è pronta”.
						</p>
					{/if}
					{#if data.event.message}<p class="wait-text quote">“{data.event.message}”</p>{/if}
				</div>
			{:else if phase !== 'revealed'}
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
					<div class="who">
						<div class="face pop">
							<Avatar
								name={data.receiver.name}
								photoId={data.receiver.photoId}
								size={176}
								tone="pine"
							/>
						</div>
						<div class="who-text">
							<h1 class="fadein late">{data.receiver.name}</h1>
							<div class="facts fadein late">
								{#if data.event.budget}<span>Budget {data.event.budget}</span>{/if}
								{#if day}<span>Scambio il {day}</span>{/if}
								<button type="button" class="replay" onclick={() => (phase = 'closed')}>
									Riapri la busta
								</button>
							</div>
						</div>
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

	{#if phase === 'revealed' || !data.receiver}
		<main class="container lists fadein late">
			{#if data.receiver}
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
			{/if}

			<section class="card">
				<h2>{data.managerName ? `La lista di ${data.me.name}` : 'La tua lista dei desideri'}</h2>
				<p class="muted">
					{data.managerName
						? `La vede solo chi fa il regalo a ${data.me.name}. La compili tu per conto suo.`
						: 'La vede solo chi ti fa il regalo.'}
				</p>
				{#if data.me.wishes.length}
					<ul class="wishes">
						{#each data.me.wishes as w (w.id)}
							<li>
								<span class="wish-text">{w.text}</span>
								<form method="POST" action="?/removeWish" use:enhance>
									<input type="hidden" name="id" value={w.id} />
									<button type="submit" class="icon-btn" aria-label="Rimuovi {w.text}">
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg
										>
									</button>
								</form>
							</li>
						{/each}
					</ul>
				{/if}
				<form class="wish-form" method="POST" action="?/addWish" use:enhance>
					<label class="sr-only" for="wish">Aggiungi un desiderio</label>
					<input
						id="wish"
						name="text"
						class="input"
						placeholder="Aggiungi un desiderio…"
						maxlength="140"
						required
					/>
					<button class="btn btn-pine" type="submit">Aggiungi</button>
				</form>
				{#if form?.error}<p class="err" role="alert">{form.error}</p>{/if}
				{#if !data.receiver}
					<form class="ready" method="POST" action="?/ready" use:enhance>
						<input type="hidden" name="ready" value={data.me.ready ? '0' : '1'} />
						{#if data.me.ready}
							<p class="ready-ok">
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.4"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"><path d="M5 12l5 5L19 7" /></svg
								>
								Lista pronta
							</p>
							<button class="text-btn" type="submit">Devo ancora aggiungere qualcosa</button>
						{:else}
							<button class="btn btn-primary" type="submit" disabled={data.me.wishes.length === 0}>
								La mia lista è pronta
							</button>
							{#if data.me.wishes.length === 0}
								<small class="muted">Aggiungi almeno un desiderio.</small>
							{/if}
						{/if}
					</form>
				{:else}
					<p class="secret">Shh… è un segreto: non dirlo a {data.receiver.name}!</p>
				{/if}
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
	.who {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 20px 36px;
		margin-top: 8px;
	}
	.face {
		flex: none;
		padding: 6px;
		border-radius: 50%;
		background: conic-gradient(
			var(--gold),
			var(--gold-300),
			var(--gold),
			var(--gold-700),
			var(--gold)
		);
		box-shadow: 0 18px 40px rgba(0, 0, 0, 0.3);
	}
	.face :global(.avatar) {
		border: 4px solid var(--holly-700);
		font-family: var(--font-display);
	}
	.who-text {
		flex: 1 1 280px;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.pop {
		animation: pop 0.9s 0.1s cubic-bezier(0.2, 1.4, 0.4, 1) both;
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: scale(0.4) rotate(-12deg);
		}
	}
	@media (max-width: 560px) {
		.face :global(.avatar) {
			width: 128px !important;
			height: 128px !important;
		}
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
	.wish-text {
		flex: 1;
	}
	.icon-btn {
		width: 44px;
		height: 44px;
		margin: -12px -10px -12px 0;
		border: 0;
		background: transparent;
		color: var(--ink-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		cursor: pointer;
	}
	.err {
		margin: 0;
		padding: 12px 14px;
		border-radius: var(--radius-sm);
		background: var(--blush);
		color: var(--holly-700);
		font-size: 14px;
	}
	.wait {
		font-size: clamp(32px, 5vw, 56px);
		line-height: 1.05;
		max-width: 18ch;
	}
	.wait-text {
		margin: 0;
		max-width: 34rem;
		font-size: 17px;
		line-height: 1.55;
		color: #f6dcd8;
	}
	.quote {
		font-style: italic;
		color: var(--gold-300);
	}
	.ready {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
		margin-top: 8px;
		padding-top: 16px;
		border-top: 1px dashed var(--sand);
	}
	.ready .btn {
		width: 100%;
	}
	.ready .btn:disabled {
		opacity: 0.55;
		cursor: default;
	}
	.ready-ok {
		margin: 0;
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
		color: var(--pine);
	}
	.text-btn {
		min-height: 44px;
		padding: 0 4px;
		border: 0;
		background: transparent;
		color: var(--ink-muted);
		font: inherit;
		font-size: 14px;
		text-decoration: underline;
		cursor: pointer;
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
