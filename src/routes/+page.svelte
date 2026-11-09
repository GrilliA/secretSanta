<script lang="ts">
	import { enhance } from '$app/forms';
	import Baubles from '#lib/components/Baubles.svelte';
	import GiftIcon from '#lib/components/GiftIcon.svelte';
	import Hills from '#lib/components/Hills.svelte';
	import Snowflake from '#lib/components/Snowflake.svelte';
	import { resolve } from '$app/paths';
	import { getT, LOCALES } from '#lib/i18n/index.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const t = $derived(getT(data.uiLocale));
	let submitting = $state(false);
</script>

<div class="page snow">
	<Baubles />
	<header class="container top">
		<GiftIcon size={30} />
		<span class="brand">{t.home.title}</span>
		<nav class="langs" aria-label={t.home.switchTo}>
			{#each LOCALES as l (l)}
				<a
					href="{resolve('/')}?lang={l}"
					hreflang={l}
					lang={l}
					aria-current={l === t.locale ? 'true' : undefined}
					data-sveltekit-reload>{getT(l).languageName}</a
				>
			{/each}
		</nav>
	</header>

	<main class="container hero">
		<section class="intro">
			<span class="eyebrow"><Snowflake /> {t.home.eyebrow}</span>
			<h1>{t.home.headline}<em>{t.home.headlineEm}</em></h1>
			<p>{t.home.intro}</p>
			<ol>
				{#each t.home.steps as step, i (i)}
					<li><span class="step" class:active={i === 0}>{i + 1}</span>{step}</li>
				{/each}
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
				<span>{t.home.stepOf(1)}</span>
				<h2>{t.home.formTitle}</h2>
			</div>
			<div class="field">
				<label for="name">{t.home.eventName}</label>
				<input id="name" name="name" class="input" value={t.home.eventNameDefault} required />
			</div>
			<div class="row">
				<div class="field">
					<label for="date">{t.home.exchangeDate}</label>
					<input id="date" name="exchangeDate" class="input" type="date" value="2026-12-25" />
				</div>
				<div class="field">
					<label for="budget">{t.common.budget}</label>
					<input id="budget" name="budget" class="input" placeholder={t.home.budgetPlaceholder} />
				</div>
			</div>
			<div class="field">
				<label for="msg">{t.home.message} <span class="muted">{t.home.optional}</span></label>
				<textarea id="msg" name="message" class="input" rows="2"></textarea>
			</div>
			<div class="row">
				<div class="field">
					<label for="oname">{t.home.yourName}</label>
					<input id="oname" name="organizerName" class="input" autocomplete="given-name" required />
				</div>
				<div class="field">
					<label for="oemail">{t.home.yourEmail}</label>
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
			<div class="field">
				<label for="locale">{t.home.language}</label>
				<select id="locale" name="locale" class="input" value={t.locale}>
					{#each LOCALES as l (l)}
						<option value={l}>{getT(l).languageName}</option>
					{/each}
				</select>
			</div>
			<label class="toggle">
				<span>
					<strong>{t.home.plays}</strong>
					<small>{t.home.playsHint}</small>
				</span>
				<input type="checkbox" name="organizerPlays" checked />
			</label>
			{#if form?.error}<p class="err" role="alert">{form.error}</p>{/if}
			<button class="btn btn-primary" type="submit" disabled={submitting}>
				{submitting ? t.home.submitting : t.home.submit}
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
	.langs {
		position: relative;
		z-index: 1;
		margin-left: auto;
		display: flex;
		gap: 4px;
		padding: 4px;
		border-radius: 999px;
		background: var(--pine-700);
	}
	.langs a {
		min-height: 36px;
		display: inline-flex;
		align-items: center;
		padding: 0 14px;
		border-radius: 999px;
		color: var(--cream);
		font-size: 14px;
		font-weight: 600;
		text-decoration: none;
	}
	.langs a[aria-current='true'] {
		background: var(--cream);
		color: var(--pine);
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
