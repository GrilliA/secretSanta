<script lang="ts">
	import { enhance } from '$app/forms';
	import Baubles from '#lib/components/Baubles.svelte';
	import GiftIcon from '#lib/components/GiftIcon.svelte';
	import Hills from '#lib/components/Hills.svelte';
	import Snowflake from '#lib/components/Snowflake.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let submitting = $state(false);
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

		<form
			class="form"
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update({ reset: false });
					submitting = false;
				};
			}}
		>
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
				<input id="name" name="name" class="input" value="Natale in famiglia" required />
			</div>
			<div class="row">
				<div class="field">
					<label for="date">Data scambio</label>
					<input id="date" name="exchangeDate" class="input" type="date" value="2026-12-25" />
				</div>
				<div class="field">
					<label for="budget">Budget</label>
					<input id="budget" name="budget" class="input" placeholder="es. 30 €" />
				</div>
			</div>
			<div class="field">
				<label for="msg">Messaggio per tutti <span class="muted">(facoltativo)</span></label>
				<textarea id="msg" name="message" class="input" rows="2"></textarea>
			</div>
			<div class="row">
				<div class="field">
					<label for="oname">Il tuo nome</label>
					<input id="oname" name="organizerName" class="input" autocomplete="given-name" required />
				</div>
				<div class="field">
					<label for="oemail">La tua email</label>
					<input
						id="oemail"
						name="organizerEmail"
						class="input"
						type="email"
						autocomplete="email"
						required
					/>
				</div>
			</div>
			<label class="toggle">
				<span>
					<strong>Partecipo anch’io</strong>
					<small>Non vedrai gli abbinamenti degli altri</small>
				</span>
				<input type="checkbox" name="organizerPlays" checked />
			</label>
			{#if form?.error}<p class="err" role="alert">{form.error}</p>{/if}
			<button class="btn btn-primary" type="submit" disabled={submitting}>
				{submitting ? 'Creo l’evento…' : 'Avanti: aggiungi partecipanti'}
			</button>
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
	.err {
		margin: 0;
		padding: 12px 14px;
		border-radius: var(--radius-sm);
		background: var(--blush);
		color: var(--holly-700);
		font-size: 14px;
	}
	.btn:disabled {
		opacity: 0.7;
		cursor: default;
	}
	.toggle input {
		width: 22px;
		height: 22px;
		accent-color: var(--pine);
	}
</style>
