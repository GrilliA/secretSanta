<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Baubles from '#lib/components/Baubles.svelte';
	import GiftIcon from '#lib/components/GiftIcon.svelte';
	import Hills from '#lib/components/Hills.svelte';
	import Snowflake from '#lib/components/Snowflake.svelte';

	let name = $state('Natale in famiglia 2026');
	let date = $state('2026-12-25');
	let budget = $state('');
	let message = $state('');
	let organizerPlays = $state(true);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		// TODO: creare l'evento sul server (form remota / action) e usare il suo id.
		goto(resolve('/evento/[id]', { id: 'demo' }));
	}
</script>

<div class="page snow">
	<Baubles />
	<header class="container top">
		<GiftIcon size={30} />
		<span class="brand">Secret Santa</span>
	</header>

	<main class="container hero">
		<section class="intro">
			<span class="eyebrow"><Snowflake /> Natale 2026</span>
			<h1>Lo scambio di regali, <em>senza bigliettini.</em></h1>
			<p>
				Crea l’evento, aggiungi la famiglia e invia gli inviti via email. Ognuno scopre in segreto a
				chi fare il regalo.
			</p>
			<ol>
				<li><span class="step active">1</span>Crea l’evento</li>
				<li><span class="step">2</span>Aggiungi i partecipanti</li>
				<li><span class="step">3</span>Estrai e invia gli inviti</li>
			</ol>
		</section>

		<form class="form" onsubmit={submit}>
			<svg class="bow" width="64" height="40" viewBox="0 0 64 40" aria-hidden="true">
				<path
					d="M32 20C22 4 6 2 6 14s16 8 26 6zM32 20c10-16 26-18 26-6s-16 8-26 6z"
					fill="var(--holly)"
				/>
				<path
					d="M32 20l-10 18M32 20l10 18"
					stroke="var(--holly)"
					stroke-width="5"
					stroke-linecap="round"
				/>
				<circle cx="32" cy="20" r="6" fill="var(--holly-700)" />
			</svg>
			<div class="form-head">
				<span>Passo 1 di 3</span>
				<h2>Il tuo evento</h2>
			</div>
			<div class="field">
				<label for="name">Nome dell’evento</label>
				<input id="name" class="input" bind:value={name} required />
			</div>
			<div class="row">
				<div class="field">
					<label for="date">Data scambio</label>
					<input id="date" class="input" type="date" bind:value={date} />
				</div>
				<div class="field">
					<label for="budget">Budget</label>
					<input id="budget" class="input" placeholder="es. 30 €" bind:value={budget} />
				</div>
			</div>
			<div class="field">
				<label for="msg">Messaggio per tutti <span class="muted">(facoltativo)</span></label>
				<textarea id="msg" class="input" rows="2" bind:value={message}></textarea>
			</div>
			<label class="toggle">
				<span>
					<strong>Partecipo anch’io</strong>
					<small>Non vedrai gli abbinamenti degli altri</small>
				</span>
				<input type="checkbox" bind:checked={organizerPlays} />
			</label>
			<button class="btn btn-primary" type="submit">Avanti: aggiungi partecipanti</button>
		</form>
	</main>
	<Hills />
</div>

<style>
	.page {
		position: relative;
		overflow: hidden;
		min-height: 100dvh;
		background-color: var(--pine);
		display: flex;
		flex-direction: column;
	}
	.top {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
		padding-block: 24px;
		color: var(--cream);
	}
	.brand {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 22px;
	}
	.hero {
		position: relative;
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		gap: 56px;
		align-items: center;
		padding-block: 40px 130px;
	}
	.intro {
		flex: 1 1 380px;
		min-width: 0;
		color: var(--cream);
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.eyebrow {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 14px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold);
	}
	h1 {
		font-size: clamp(44px, 5.4vw, 72px);
		line-height: 1;
	}
	h1 em {
		font-weight: 600;
		color: var(--gold-300);
	}
	.intro p {
		margin: 0;
		font-size: 18px;
		line-height: 1.6;
		color: var(--mist);
		max-width: 30rem;
	}
	ol {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	li {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.step {
		width: 34px;
		height: 34px;
		flex: none;
		border-radius: 50%;
		border: 1.5px solid var(--gold);
		color: var(--gold-300);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
	}
	.step.active {
		background: var(--holly);
		border-color: var(--holly);
		color: #fff;
	}
	.form {
		position: relative;
		flex: 1 1 440px;
		min-width: 0;
		background: var(--cream);
		border-radius: var(--radius-xl);
		padding: 40px 36px 36px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
	}
	@media (max-width: 520px) {
		.form {
			padding: 36px 20px 24px;
		}
	}
	.bow {
		position: absolute;
		top: -20px;
		left: 50%;
		margin-left: -32px;
	}
	.form-head {
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.form-head span {
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--holly-700);
	}
	.form-head h2 {
		font-size: 30px;
		color: var(--pine);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}
	.row .field {
		flex: 1 1 160px;
	}
	.muted {
		font-weight: 400;
		color: var(--ink-muted);
	}
	.toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 14px 16px;
		background: var(--cream-200);
		border-radius: var(--radius-sm);
		cursor: pointer;
	}
	.toggle span {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.toggle small {
		font-size: 13px;
		color: var(--ink-muted);
	}
	.toggle input {
		width: 22px;
		height: 22px;
		accent-color: var(--pine);
	}
</style>
