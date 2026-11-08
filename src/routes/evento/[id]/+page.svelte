<script lang="ts">
	import { untrack } from 'svelte';
	import { resolve } from '$app/paths';
	import { draw, DrawImpossibleError } from '#lib/draw.ts';
	import { buildInvites, normalizeEmail } from '#lib/invites.ts';
	import GiftIcon from '#lib/components/GiftIcon.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type P = (typeof data.participants)[number];

	// Stato locale inizializzato dai dati caricati (demo): in futuro sarà persistito sul server.
	let participants = $state<P[]>(untrack(() => structuredClone(data.participants)));
	let exclusions = $state<[string, string][]>(untrack(() => structuredClone(data.exclusions)));

	let newName = $state('');
	let newEmail = $state('');
	let newManagedBy = $state('');
	let exA = $state('');
	let exB = $state('');
	let drawError = $state<string | null>(null);
	let sent = $state<ReturnType<typeof buildInvites> | null>(null);

	const byId = $derived(new Map(participants.map((p) => [p.id, p])));
	const nameOf = (id: string) => byId.get(id)?.name ?? '?';

	function addParticipant(e: SubmitEvent) {
		e.preventDefault();
		const manager = newManagedBy ? byId.get(newManagedBy) : undefined;
		const email = manager ? manager.email : normalizeEmail(newEmail);
		if (!newName.trim() || !email) return;
		participants.push({
			id: crypto.randomUUID(),
			name: newName.trim(),
			email,
			managedById: manager?.id ?? null,
			isOrganizer: false,
			token: crypto.randomUUID()
		});
		newName = newEmail = newManagedBy = '';
	}

	function removeParticipant(id: string) {
		participants = participants
			.filter((p) => p.id !== id)
			.map((p) => (p.managedById === id ? { ...p, managedById: null } : p));
		exclusions = exclusions.filter(([a, b]) => a !== id && b !== id);
	}

	function addExclusion(e: SubmitEvent) {
		e.preventDefault();
		if (!exA || !exB || exA === exB) return;
		const exists = exclusions.some(
			([a, b]) => (a === exA && b === exB) || (a === exB && b === exA)
		);
		if (!exists) exclusions.push([exA, exB]);
		exA = exB = '';
	}

	function drawAndSend() {
		drawError = null;
		try {
			// TODO: l'estrazione va fatta sul server, che salva gli abbinamenti e spedisce le email.
			draw(
				participants.map((p) => p.id),
				exclusions
			);
			sent = buildInvites(participants);
		} catch (err) {
			drawError = err instanceof DrawImpossibleError ? err.message : 'Qualcosa è andato storto.';
		}
	}
</script>

<div class="page">
	<header class="head snow">
		<div class="container head-inner">
			<div class="head-top">
				<div class="brand"><GiftIcon size={28} /> {data.event.name}</div>
				<div class="progress">
					<span>Passo 2 di 3</span>
					<i class="on"></i><i class="on"></i><i></i>
				</div>
			</div>
			<div class="title">
				<a href={resolve('/')} class="back" aria-label="Indietro">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg
					>
				</a>
				<h1>Chi partecipa?</h1>
			</div>
		</div>
		<svg class="hill" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
			<path d="M0 40 Q 360 0 720 34 T 1440 30 V60 H0z" fill="var(--cream)" />
		</svg>
	</header>

	<main class="container layout">
		<section class="card list">
			<div class="list-head">
				<h2>Partecipanti</h2>
				<span>{participants.length} persone</span>
			</div>

			{#each participants as p (p.id)}
				<div class="person" class:managed={p.managedById}>
					<div class="avatar" class:org={p.isOrganizer} class:red={p.managedById}>
						{p.name[0]}
					</div>
					<div class="info">
						<span class="pname">
							{p.name}
							{#if p.isOrganizer}<small>· organizzatore</small>{/if}
						</span>
						<span class="pmail">{p.email}</span>
						{#if p.managedById}
							<span class="badge">Gestito da {nameOf(p.managedById)} · mail separata</span>
						{/if}
					</div>
					{#if !p.isOrganizer}
						<button
							type="button"
							class="icon-btn"
							aria-label="Rimuovi {p.name}"
							onclick={() => removeParticipant(p.id)}
						>
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg
							>
						</button>
					{/if}
				</div>
			{/each}

			<form class="add" onsubmit={addParticipant}>
				<div class="field">
					<label for="pnome">Nome</label>
					<input id="pnome" class="input" placeholder="es. Sara" bind:value={newName} required />
				</div>
				<div class="field">
					<label for="pmgr">L’invito arriva a</label>
					<select id="pmgr" class="input" bind:value={newManagedBy}>
						<option value="">Alla sua email</option>
						{#each participants.filter((p) => !p.managedById) as p (p.id)}
							<option value={p.id}>{p.name} (gestisce lui/lei)</option>
						{/each}
					</select>
				</div>
				{#if !newManagedBy}
					<div class="field grow">
						<label for="pmail">Email</label>
						<input
							id="pmail"
							class="input"
							type="email"
							placeholder="anche la stessa di un altro partecipante"
							bind:value={newEmail}
							required
						/>
					</div>
				{/if}
				<button class="btn btn-pine" type="submit">Aggiungi</button>
			</form>
		</section>

		<aside class="side">
			<section class="card">
				<h2>Esclusioni</h2>
				<p class="muted">Coppie che non devono pescarsi a vicenda.</p>
				{#each exclusions as [a, b], i (a + b)}
					<div class="excl">
						<span>{nameOf(a)} ↔ {nameOf(b)}</span>
						<button
							type="button"
							class="icon-btn"
							aria-label="Rimuovi esclusione {nameOf(a)} e {nameOf(b)}"
							onclick={() => exclusions.splice(i, 1)}
						>
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg
							>
						</button>
					</div>
				{/each}
				<form class="excl-form" onsubmit={addExclusion}>
					<label class="sr-only" for="exa">Prima persona</label>
					<select id="exa" class="input" bind:value={exA}>
						<option value="">Persona…</option>
						{#each participants as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
					</select>
					<label class="sr-only" for="exb">Seconda persona</label>
					<select id="exb" class="input" bind:value={exB}>
						<option value="">Persona…</option>
						{#each participants as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
					</select>
					<button class="btn btn-pine" type="submit">Aggiungi</button>
				</form>
			</section>

			<section class="cta snow">
				{#if sent}
					<span class="cta-title">Inviti partiti!</span>
					<ul class="sent">
						{#each sent as inv (inv.participantId)}
							<li>
								<strong>{inv.subject}</strong> → {inv.to}
								<a href={resolve('/r/[token]', { token: inv.token })}>apri</a>
							</li>
						{/each}
					</ul>
					<a class="link-light" href={resolve('/anteprima/email')}>Anteprima email</a>
				{:else}
					<span class="cta-title">Pronti a pescare?</span>
					<button class="btn btn-cream" type="button" onclick={drawAndSend}>
						Estrai e invia {participants.length} inviti
					</button>
					{#if drawError}<p class="err" role="alert">{drawError}</p>{/if}
					<small>Nessuno, nemmeno tu, vedrà gli abbinamenti.</small>
				{/if}
			</section>
		</aside>
	</main>
</div>

<style>
	.page {
		min-height: 100dvh;
		background: var(--cream);
	}
	.head {
		position: relative;
		background-color: var(--pine);
		color: var(--cream);
		padding-bottom: 72px;
	}
	.head-inner {
		padding-top: 20px;
		display: flex;
		flex-direction: column;
		gap: 28px;
	}
	.head-top {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 20px;
	}
	.progress {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 14px;
		color: var(--mist);
	}
	.progress span {
		margin-right: 6px;
	}
	.progress i {
		width: 40px;
		height: 4px;
		border-radius: 2px;
		background: var(--pine-600);
	}
	.progress i.on {
		background: var(--gold);
	}
	.title {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.title h1 {
		font-size: clamp(32px, 4vw, 44px);
	}
	.back {
		width: 44px;
		height: 44px;
		border-radius: var(--radius-sm);
		background: var(--pine-700);
		color: var(--cream);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.hill {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 50px;
		display: block;
	}
	.layout {
		position: relative;
		margin-top: -16px;
		padding-bottom: 56px;
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		align-items: flex-start;
	}
	.list {
		flex: 999 1 520px;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.list-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
	h2 {
		font-size: 22px;
		color: var(--pine);
	}
	.list-head span,
	.muted {
		font-size: 14px;
		color: var(--ink-muted);
	}
	.muted {
		margin: 6px 0 12px;
	}
	.person {
		display: flex;
		align-items: center;
		gap: 14px;
		min-height: 68px;
		padding: 10px 10px 10px 16px;
		border: 1.5px solid var(--cream-300);
		border-radius: var(--radius-md);
	}
	.person.managed {
		border-color: #efc9c4;
		background: var(--blush);
	}
	.avatar {
		width: 40px;
		height: 40px;
		flex: none;
		border-radius: 50%;
		background: var(--cream-200);
		color: var(--pine);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
	}
	.avatar.org {
		background: var(--pine);
		color: var(--gold-300);
	}
	.avatar.red {
		background: var(--holly);
		color: #fff;
	}
	.info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 16px;
	}
	.pname {
		flex: 0 1 180px;
		font-weight: 600;
	}
	.pname small {
		font-weight: 500;
		font-size: 13px;
		color: #8a6a1c;
	}
	.pmail {
		flex: 1 1 180px;
		font-size: 14px;
		color: var(--ink-muted);
		overflow-wrap: anywhere;
	}
	.badge {
		padding: 6px 10px;
		margin-left: auto;
		background: #fff;
		border-radius: 999px;
		font-size: 13px;
		color: var(--holly-700);
	}
	.icon-btn {
		width: 44px;
		height: 44px;
		border: 0;
		background: transparent;
		color: var(--ink-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		cursor: pointer;
	}
	.icon-btn:hover {
		background: var(--cream-200);
	}
	.add {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		align-items: flex-end;
		margin-top: 8px;
		padding-top: 16px;
		border-top: 1px dashed var(--sand);
	}
	.add .field {
		flex: 1 1 160px;
	}
	.add .field.grow {
		flex: 2 1 220px;
	}
	.side {
		flex: 1 1 300px;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.excl {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 4px 4px 4px 14px;
		margin-bottom: 8px;
		background: var(--cream-200);
		border-radius: var(--radius-sm);
		font-size: 14px;
	}
	.excl span {
		flex: 1;
	}
	.excl-form {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.excl-form select {
		flex: 1 1 110px;
		min-width: 0;
	}
	.cta {
		background-color: var(--holly-700);
		color: #fff;
		border-radius: var(--radius-lg);
		padding: 28px 24px 24px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.cta-title {
		font-family: var(--font-display);
		font-style: italic;
		font-weight: 600;
		font-size: 22px;
		color: var(--gold-300);
	}
	.cta small {
		font-size: 13px;
		color: #f6dcd8;
	}
	.err {
		margin: 0;
		padding: 10px 12px;
		border-radius: var(--radius-sm);
		background: var(--blush);
		color: var(--holly-700);
		font-size: 14px;
	}
	.sent {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 14px;
	}
	.sent a,
	.link-light {
		color: var(--gold-300);
	}
</style>
