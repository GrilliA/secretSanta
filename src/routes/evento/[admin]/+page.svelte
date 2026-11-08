<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Avatar from '#lib/components/Avatar.svelte';
	import GiftIcon from '#lib/components/GiftIcon.svelte';
	import { preparePhoto, replaceInputFile } from '#lib/photo-client.ts';
	import { formatDay } from '#lib/format.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const drawn = $derived(Boolean(data.event.drawnAt));
	const byId = $derived(new Map(data.participants.map((p) => [p.id, p])));
	const nameOf = (id: string) => byId.get(id)?.name ?? '?';
	const managers = $derived(data.participants.filter((p) => !p.managedById));
	const opened = $derived(data.participants.filter((p) => p.inviteOpenedAt).length);
	const total = $derived(data.participants.length);
	const ready = $derived(data.participants.filter((p) => p.wishlistReadyAt).length);
	const notInvited = $derived(data.participants.filter((p) => !p.wishlistInvitedAt).length);
	const anyInvited = $derived(notInvited < total);

	const countLabel = $derived(
		(total === 1 ? '1 persona' : `${total} persone`) +
			(drawn ? ` · ${opened} hanno aperto la busta` : anyInvited ? ` · ${ready} liste pronte` : '')
	);

	/** Stato della riga nella fase in corso. */
	function statusOf(p: (typeof data.participants)[number]) {
		if (drawn) {
			if (p.inviteOpenedAt) return { label: 'Busta aperta', ok: true };
			return { label: p.inviteSentAt ? 'Busta inviata' : 'Non inviata', ok: false };
		}
		if (p.wishlistReadyAt) return { label: 'Lista pronta', ok: true };
		if (p.wishlistInvitedAt) return { label: 'Sta scrivendo la lista', ok: false };
		return null;
	}

	let managedBy = $state('');
	let newPhotoPreview = $state<string | null>(null);
	let photoError = $state<string | null>(null);

	/** Ritaglia e riduce la foto nel browser, poi la rimette nell'input del form. */
	async function onPhotoChange(e: Event, autoSubmit = false) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		photoError = null;
		if (!file) return;
		try {
			const prepared = await preparePhoto(file);
			replaceInputFile(input, prepared);
			if (autoSubmit) input.form?.requestSubmit();
			else {
				if (newPhotoPreview) URL.revokeObjectURL(newPhotoPreview);
				newPhotoPreview = URL.createObjectURL(prepared);
			}
		} catch {
			photoError = 'Non riesco a leggere questa immagine: prova con un’altra foto.';
			input.value = '';
		}
	}
	let busy = $state(false);
	let copied = $state(false);

	const adminLink = $derived(page.url.origin + page.url.pathname);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(adminLink);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			/* clipboard non disponibile: il link resta selezionabile */
		}
	}

	/** enhance che non svuota i campi in caso di errore e mostra lo stato di invio. */
	const submit = () => {
		busy = true;
		return async ({
			update,
			result
		}: {
			update: (o?: { reset?: boolean }) => Promise<void>;
			result: { type: string };
		}) => {
			await update({ reset: result.type === 'success' });
			if (result.type === 'success') {
				managedBy = '';
				if (newPhotoPreview) URL.revokeObjectURL(newPhotoPreview);
				newPhotoPreview = null;
			}
			busy = false;
		};
	};

	const confirmDraw = (e: SubmitEvent) => {
		const missing = total - ready;
		const warning =
			anyInvited && missing > 0
				? `${missing === 1 ? '1 persona non ha' : `${missing} persone non hanno`} ancora finito la lista. `
				: '';
		if (
			!confirm(
				`${warning}Estrarre e inviare ${total} buste? Dopo non potrai più modificare i partecipanti.`
			)
		)
			e.preventDefault();
	};

	const xIcon = 'M6 6l12 12M18 6L6 18';
</script>

<svelte:head><title>Gestisci · {data.event.name}</title></svelte:head>

<div class="page">
	<header class="head snow">
		<div class="container head-inner">
			<div class="head-top">
				<div class="brand"><GiftIcon size={28} /> {data.event.name}</div>
				<div class="progress">
					<span>Passo {drawn ? 3 : 2} di 3</span>
					<i class="on"></i><i class="on"></i><i class:on={drawn}></i>
				</div>
			</div>
			<div class="title">
				<a href={resolve('/')} class="back" aria-label="Crea un altro evento">
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
				<h1>{drawn ? 'Inviti partiti!' : 'Chi partecipa?'}</h1>
			</div>
			{#if data.event.exchangeDate || data.event.budget}
				<div class="facts">
					{#if data.event.exchangeDate}<span>Scambio il {formatDay(data.event.exchangeDate)}</span
						>{/if}
					{#if data.event.budget}<span>Budget {data.event.budget}</span>{/if}
				</div>
			{/if}
		</div>
		<svg class="hill" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
			<path d="M0 40 Q 360 0 720 34 T 1440 30 V60 H0z" fill="var(--cream)" />
		</svg>
	</header>

	<main class="container layout">
		<section class="save card">
			<div>
				<strong>{data.isNew ? 'Evento creato!' : 'Il tuo link di gestione'}</strong>
				<p>
					Salva questo link: è l’unico modo per gestire l’evento. Te l’abbiamo mandato anche a
					{data.event.organizerEmail}.
				</p>
			</div>
			<div class="link-row">
				<input class="input" readonly value={adminLink} aria-label="Link di gestione" />
				<button type="button" class="btn btn-pine" onclick={copyLink}
					>{copied ? 'Copiato!' : 'Copia'}</button
				>
			</div>
		</section>

		{#if form?.error}<p class="err banner" role="alert">{form.error}</p>{/if}

		<section class="card list">
			<div class="list-head">
				<h2>Partecipanti</h2>
				<span>{countLabel}</span>
			</div>

			{#each data.participants as p (p.id)}
				<div class="person" class:managed={p.managedById}>
					<form
						class="photo-pick"
						method="POST"
						action="?/photo"
						enctype="multipart/form-data"
						use:enhance={submit}
					>
						<input type="hidden" name="id" value={p.id} />
						<label title={p.photoId ? 'Cambia foto' : 'Aggiungi foto'}>
							<Avatar
								name={p.name}
								photoId={p.photoId}
								tone={p.isOrganizer ? 'pine' : p.managedById ? 'holly' : 'cream'}
							/>
							<span class="cam" aria-hidden="true">
								<svg
									width="12"
									height="12"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.4"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg
								>
							</span>
							<input
								class="sr-only"
								type="file"
								name="photo"
								accept="image/*"
								aria-label="{p.photoId ? 'Cambia' : 'Aggiungi'} la foto di {p.name}"
								disabled={busy}
								onchange={(e) => onPhotoChange(e, true)}
							/>
						</label>
					</form>
					<div class="info">
						<span class="pname">
							{p.name}
							{#if p.isOrganizer}<small>· organizzatore</small>{/if}
						</span>
						<span class="pmail">{p.email}</span>
						{#if p.managedById}
							<span class="badge">Gestito da {nameOf(p.managedById)} · mail separata</span>
						{/if}
						{#if statusOf(p)}
							{@const st = statusOf(p)!}
							<span class="status" class:ok={st.ok}>{st.label}</span>
						{/if}
					</div>
					{#if drawn || p.wishlistInvitedAt}
						<form method="POST" action="?/resend" use:enhance={submit}>
							<input type="hidden" name="id" value={p.id} />
							<button
								class="text-btn"
								type="submit"
								disabled={busy}
								aria-label="Rimanda l’invito a {p.name}">Rimanda</button
							>
						</form>
					{/if}
					{#if !drawn}
						<form method="POST" action="?/remove" use:enhance={submit}>
							<input type="hidden" name="id" value={p.id} />
							<button type="submit" class="icon-btn" aria-label="Rimuovi {p.name}" disabled={busy}>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									aria-hidden="true"><path d={xIcon} /></svg
								>
							</button>
						</form>
					{/if}
				</div>
			{:else}
				<p class="muted">Ancora nessuno. Aggiungi la prima persona qui sotto.</p>
			{/each}

			{#if photoError}<p class="err" role="alert">{photoError}</p>{/if}
			{#if !drawn}
				<form
					class="add"
					method="POST"
					action="?/add"
					enctype="multipart/form-data"
					use:enhance={submit}
				>
					<label class="photo-field">
						<Avatar name="+" src={newPhotoPreview} size={56} />
						<span>{newPhotoPreview ? 'Cambia foto' : 'Foto'}<small>facoltativa</small></span>
						<input
							class="sr-only"
							type="file"
							name="photo"
							accept="image/*"
							onchange={(e) => onPhotoChange(e)}
						/>
					</label>
					<div class="field">
						<label for="pnome">Nome</label>
						<input id="pnome" name="name" class="input" placeholder="es. Sara" required />
					</div>
					<div class="field">
						<label for="pmgr">L’invito arriva a</label>
						<select id="pmgr" name="managedById" class="input" bind:value={managedBy}>
							<option value="">Alla sua email</option>
							{#each managers as m (m.id)}
								<option value={m.id}>{m.name} (gestisce l’invito)</option>
							{/each}
						</select>
					</div>
					{#if !managedBy}
						<div class="field grow">
							<label for="pmail">Email</label>
							<input
								id="pmail"
								name="email"
								class="input"
								type="email"
								placeholder="anche la stessa di un altro partecipante"
								required
							/>
						</div>
					{/if}
					<button class="btn btn-pine" type="submit" disabled={busy}>Aggiungi</button>
				</form>
			{/if}
		</section>

		<aside class="side">
			{#if !drawn}
				<section class="card">
					<h2>Esclusioni</h2>
					<p class="muted">Coppie che non devono pescarsi a vicenda.</p>
					{#each data.exclusions as ex (ex.aId + ex.bId)}
						<form class="excl" method="POST" action="?/unexclude" use:enhance={submit}>
							<input type="hidden" name="a" value={ex.aId} />
							<input type="hidden" name="b" value={ex.bId} />
							<span>{nameOf(ex.aId)} ↔ {nameOf(ex.bId)}</span>
							<button
								type="submit"
								class="icon-btn"
								aria-label="Rimuovi esclusione {nameOf(ex.aId)} e {nameOf(ex.bId)}"
								disabled={busy}
							>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									aria-hidden="true"><path d={xIcon} /></svg
								>
							</button>
						</form>
					{/each}
					<form class="excl-form" method="POST" action="?/exclude" use:enhance={submit}>
						<label class="sr-only" for="exa">Prima persona</label>
						<select id="exa" name="a" class="input" required>
							<option value="">Persona…</option>
							{#each data.participants as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
						</select>
						<label class="sr-only" for="exb">Seconda persona</label>
						<select id="exb" name="b" class="input" required>
							<option value="">Persona…</option>
							{#each data.participants as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
						</select>
						<button class="btn btn-pine" type="submit" disabled={busy}>Aggiungi</button>
					</form>
				</section>
			{/if}

			<section class="cta snow">
				{#if drawn}
					<span class="cta-title">Fatto!</span>
					<p>
						Ognuno ha ricevuto il suo link segreto. Se qualcuno non trova la mail, usa “Rimanda”.
					</p>
					{#if form && 'sent' in form && typeof form.sent === 'number'}
						<p class="note">
							Inviate {form.sent} email{#if form.failed?.length}; non riuscite: {form.failed.join(
									', '
								)}{/if}.
						</p>
					{/if}
					<small>Nessuno, nemmeno tu, può vedere gli abbinamenti.</small>
				{:else}
					<ol class="steps">
						<li class:done={anyInvited && ready === total}>
							<span class="step-title">1. Liste dei desideri</span>
							{#if !anyInvited}
								<p>Ognuno riceve una mail per scrivere la sua lista.</p>
							{:else}
								<div
									class="meter"
									role="progressbar"
									aria-valuemin="0"
									aria-valuemax={total}
									aria-valuenow={ready}
									aria-label="Liste pronte"
								>
									<span style:width="{total ? (ready / total) * 100 : 0}%"></span>
								</div>
								<p>
									<strong>{ready} di {total}</strong> liste pronte.
									{ready === total
										? 'Tutti hanno finito!'
										: 'Ti mandiamo una mail quando tutti hanno finito.'}
								</p>
							{/if}
							{#if notInvited > 0}
								<form method="POST" action="?/inviteWishlist" use:enhance={submit}>
									<button class="btn btn-cream" type="submit" disabled={busy || total === 0}>
										{busy
											? 'Un attimo…'
											: anyInvited
												? `Invita ${notInvited === 1 ? 'la persona nuova' : `le ${notInvited} persone nuove`}`
												: `Invia ${total} inviti per la lista`}
									</button>
								</form>
							{/if}
						</li>
						<li>
							<span class="step-title">2. Estrazione</span>
							<form method="POST" action="?/draw" use:enhance={submit} onsubmit={confirmDraw}>
								<button
									class="btn"
									class:btn-cream={anyInvited && ready === total}
									class:btn-ghost={!(anyInvited && ready === total)}
									type="submit"
									disabled={busy || total < 3}
								>
									{busy ? 'Un attimo…' : `Estrai e invia le buste`}
								</button>
							</form>
							{#if total < 3}<small>Servono almeno 3 persone.</small>{/if}
						</li>
					</ol>
					{#if form && 'invited' in form && typeof form.sent === 'number'}
						<p class="note">
							Inviate {form.sent} email{#if form.failed?.length}; non riuscite: {form.failed.join(
									', '
								)}{/if}.
						</p>
					{/if}
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
		gap: 24px;
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
		flex: none;
		border-radius: var(--radius-sm);
		background: var(--pine-700);
		color: var(--cream);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.facts span {
		padding: 6px 12px;
		border-radius: 999px;
		border: 1.5px solid var(--gold);
		font-size: 14px;
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
	.save {
		flex: 1 1 100%;
		display: flex;
		flex-wrap: wrap;
		gap: 12px 24px;
		align-items: center;
		justify-content: space-between;
		background: #fffaf0;
		border-color: var(--gold);
	}
	.save > div:first-child {
		flex: 1 1 320px;
	}
	.save p {
		margin: 4px 0 0;
		font-size: 14px;
		color: var(--ink-muted);
	}
	.link-row {
		flex: 1 1 360px;
		display: flex;
		gap: 8px;
	}
	.link-row .input {
		flex: 1;
		min-width: 0;
		height: 46px;
		font-size: 14px;
	}
	.banner {
		flex: 1 1 100%;
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
		flex-wrap: wrap;
		gap: 8px;
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
	.photo-pick label {
		position: relative;
		display: block;
		border-radius: 50%;
		cursor: pointer;
	}
	.photo-pick label:focus-within {
		outline: 3px solid var(--gold);
		outline-offset: 2px;
	}
	.cam {
		position: absolute;
		right: -4px;
		bottom: -4px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #fff;
		border: 1px solid var(--cream-300);
		color: var(--pine);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.photo-field {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 56px;
		padding-right: 8px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 600;
	}
	.photo-field span:last-of-type {
		display: flex;
		flex-direction: column;
	}
	.photo-field small {
		font-weight: 400;
		color: var(--ink-muted);
	}
	.photo-field:focus-within {
		outline: 3px solid var(--gold);
		outline-offset: 4px;
		border-radius: var(--radius-sm);
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
	.badge,
	.status {
		padding: 6px 10px;
		background: #fff;
		border-radius: 999px;
		font-size: 13px;
		color: var(--holly-700);
	}
	.status {
		background: var(--cream-200);
		color: var(--ink-muted);
	}
	.status.ok {
		background: #e3efe8;
		color: var(--pine);
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
	.text-btn {
		min-height: 44px;
		padding: 0 12px;
		border: 0;
		background: transparent;
		color: var(--pine);
		font: inherit;
		font-size: 14px;
		font-weight: 600;
		text-decoration: underline;
		cursor: pointer;
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
	.cta .btn {
		width: 100%;
	}
	.cta p {
		margin: 0;
		font-size: 15px;
		line-height: 1.5;
	}
	.cta .note {
		font-size: 14px;
		color: var(--gold-300);
	}
	.steps {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.steps li {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.steps li + li {
		padding-top: 18px;
		border-top: 1px dashed rgba(255, 255, 255, 0.3);
	}
	.step-title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 20px;
		color: var(--gold-300);
	}
	.steps li.done .step-title::after {
		content: ' ✓';
	}
	.meter {
		height: 8px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.2);
		overflow: hidden;
	}
	.meter span {
		display: block;
		height: 100%;
		background: var(--gold);
		border-radius: 4px;
		transition: width 0.4s ease;
	}
	.btn-ghost {
		background: transparent;
		color: #fff;
		border: 1.5px solid rgba(255, 255, 255, 0.6);
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
		padding: 12px 14px;
		border-radius: var(--radius-sm);
		background: var(--blush);
		color: var(--holly-700);
		font-size: 14px;
	}
	button:disabled {
		opacity: 0.6;
		cursor: default;
	}
</style>
