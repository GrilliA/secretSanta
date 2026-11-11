<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Avatar from '#lib/components/Avatar.svelte';
	import VideoUpload from '#lib/components/VideoUpload.svelte';
	import GiftIcon from '#lib/components/GiftIcon.svelte';
	import { preparePhoto, replaceInputFile } from '#lib/photo-client.ts';
	import { formatDay } from '#lib/format.ts';
	import { getT } from '#lib/i18n/index.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const t = $derived(getT(data.locale));
	const a = $derived(t.admin);

	$effect(() => {
		document.documentElement.lang = t.locale;
	});

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
		t.common.people(total) + (drawn ? a.openedCount(opened) : anyInvited ? a.readyCount(ready) : '')
	);

	/** Stato della riga nella fase in corso. */
	function statusOf(p: (typeof data.participants)[number]) {
		if (drawn) {
			if (p.inviteOpenedAt) return { label: a.status.opened, ok: true };
			return { label: p.inviteSentAt ? a.status.sent : a.status.notSent, ok: false };
		}
		if (p.wishlistReadyAt) return { label: a.status.ready, ok: true };
		if (p.wishlistInvitedAt) return { label: a.status.writing, ok: false };
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
			photoError = a.photoError;
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
		const warning = anyInvited && missing > 0 ? a.confirmMissing(missing) : '';
		if (!confirm(`${warning}${a.confirmDraw(total)}`)) e.preventDefault();
	};

	const xIcon = 'M6 6l12 12M18 6L6 18';
</script>

<svelte:head><title>{a.pageTitle(data.event.name)}</title></svelte:head>

<div class="page">
	<header class="head snow">
		<div class="container head-inner">
			<div class="head-top">
				<div class="brand"><GiftIcon size={28} /> {data.event.name}</div>
				<div class="progress">
					<span>{a.stepOf(drawn ? 3 : 2)}</span>
					<i class="on"></i><i class="on"></i><i class:on={drawn}></i>
				</div>
			</div>
			<div class="title">
				<a href={resolve('/')} class="back" aria-label={a.back}>
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
				<h1>{drawn ? a.titleDrawn : a.title}</h1>
			</div>
			{#if data.event.exchangeDate || data.event.budget}
				<div class="facts">
					{#if data.event.exchangeDate}<span
							>{t.common.exchangeOn(formatDay(data.event.exchangeDate, t.intlLocale) ?? '')}</span
						>{/if}
					{#if data.event.budget}<span>{t.common.budget} {data.event.budget}</span>{/if}
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
				<strong>{data.isNew ? a.created : a.yourLink}</strong>
				<p>{a.saveLink(data.event.organizerEmail)}</p>
			</div>
			<div class="link-row">
				<input class="input" readonly value={adminLink} aria-label={a.linkLabel} />
				<button type="button" class="btn btn-pine" onclick={copyLink}
					>{copied ? a.copied : a.copy}</button
				>
			</div>
		</section>

		{#if form?.error}<p class="err banner" role="alert">{form.error}</p>{/if}

		<section class="card list">
			<div class="list-head">
				<h2>{a.participants}</h2>
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
						<label title={p.photoId ? a.changePhoto : a.addPhoto}>
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
								aria-label={a.photoInputLabel(Boolean(p.photoId), p.name)}
								disabled={busy}
								onchange={(e) => onPhotoChange(e, true)}
							/>
						</label>
					</form>
					<div class="info">
						<span class="pname">
							{p.name}
							{#if p.isOrganizer}<small>{a.organizer}</small>{/if}
						</span>
						<span class="pmail">{p.email}</span>
						{#if p.managedById}
							<span class="badge">{a.managedBy(nameOf(p.managedById))}</span>
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
								aria-label={a.resendLabel(p.name)}>{a.resend}</button
							>
						</form>
					{/if}
					{#if !drawn}
						<form method="POST" action="?/remove" use:enhance={submit}>
							<input type="hidden" name="id" value={p.id} />
							<button type="submit" class="icon-btn" aria-label={a.remove(p.name)} disabled={busy}>
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
				<p class="muted">{a.empty}</p>
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
						<span>{newPhotoPreview ? a.changePhoto : a.photo}<small>{a.photoOptional}</small></span>
						<input
							class="sr-only"
							type="file"
							name="photo"
							accept="image/*"
							onchange={(e) => onPhotoChange(e)}
						/>
					</label>
					<div class="field">
						<label for="pnome">{a.name}</label>
						<input id="pnome" name="name" class="input" placeholder={a.namePlaceholder} required />
					</div>
					<div class="field">
						<label for="pmgr">{a.inviteGoesTo}</label>
						<select id="pmgr" name="managedById" class="input" bind:value={managedBy}>
							<option value="">{a.ownEmail}</option>
							{#each managers as m (m.id)}
								<option value={m.id}>{a.managerOption(m.name)}</option>
							{/each}
						</select>
					</div>
					{#if !managedBy}
						<div class="field grow">
							<label for="pmail">{a.email}</label>
							<input
								id="pmail"
								name="email"
								class="input"
								type="email"
								placeholder={a.emailPlaceholder}
								required
							/>
						</div>
					{/if}
					<button class="btn btn-pine" type="submit" disabled={busy}>{t.common.add}</button>
				</form>
			{/if}
		</section>

		<aside class="side">
			{#if !drawn}
				<section class="card">
					<h2>{a.exclusions}</h2>
					<p class="muted">{a.exclusionsHint}</p>
					{#each data.exclusions as ex (ex.aId + ex.bId)}
						<form class="excl" method="POST" action="?/unexclude" use:enhance={submit}>
							<input type="hidden" name="a" value={ex.aId} />
							<input type="hidden" name="b" value={ex.bId} />
							<span>{nameOf(ex.aId)} ↔ {nameOf(ex.bId)}</span>
							<button
								type="submit"
								class="icon-btn"
								aria-label={a.removeExclusion(nameOf(ex.aId), nameOf(ex.bId))}
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
						<label class="sr-only" for="exa">{a.firstPerson}</label>
						<select id="exa" name="a" class="input" required>
							<option value="">{a.person}</option>
							{#each data.participants as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
						</select>
						<label class="sr-only" for="exb">{a.secondPerson}</label>
						<select id="exb" name="b" class="input" required>
							<option value="">{a.person}</option>
							{#each data.participants as p (p.id)}<option value={p.id}>{p.name}</option>{/each}
						</select>
						<button class="btn btn-pine" type="submit" disabled={busy}>{t.common.add}</button>
					</form>
				</section>
			{/if}

			<section class="card video-card">
				<h2>{a.video.title}</h2>
				<p class="muted">{a.video.hint}</p>
				<VideoUpload
					t={a.video}
					slot="desktop"
					label={a.video.desktop}
					hint={a.video.desktopHint}
					mode={data.videoMode}
					eventId={data.event.id}
					adminToken={page.params.admin ?? ''}
					videoUrl={data.event.videoUrl}
					videoPoster={data.event.videoPoster}
				/>
				<VideoUpload
					t={a.video}
					slot="mobile"
					label={a.video.mobile}
					hint={a.video.mobileHint}
					mode={data.videoMode}
					eventId={data.event.id}
					adminToken={page.params.admin ?? ''}
					videoUrl={data.event.videoMobileUrl}
					videoPoster={data.event.videoMobilePoster}
				/>
			</section>

			<section class="cta snow">
				{#if drawn}
					<span class="cta-title">{a.done}</span>
					<p>
						{a.doneText}
					</p>
					{#if form && 'sent' in form && typeof form.sent === 'number'}
						<p class="note">
							{a.sentReport(form.sent, form.failed ?? [])}
						</p>
					{/if}
					<small>{a.nobodyCanSee}</small>
				{:else}
					<ol class="steps">
						<li class:done={anyInvited && ready === total}>
							<span class="step-title">{a.step1}</span>
							{#if !anyInvited}
								<p>{a.step1Hint}</p>
							{:else}
								<div
									class="meter"
									role="progressbar"
									aria-valuemin="0"
									aria-valuemax={total}
									aria-valuenow={ready}
									aria-label={a.readyMeterLabel}
								>
									<span style:width="{total ? (ready / total) * 100 : 0}%"></span>
								</div>
								<p>
									<strong>{a.readyOf(ready, total)}</strong>{a.readySuffix}
									{ready === total ? a.allDone : a.willNotify}
								</p>
							{/if}
							{#if notInvited > 0}
								<form method="POST" action="?/inviteWishlist" use:enhance={submit}>
									<button class="btn btn-cream" type="submit" disabled={busy || total === 0}>
										{busy
											? t.common.wait
											: anyInvited
												? a.inviteNew(notInvited)
												: a.inviteAll(total)}
									</button>
								</form>
							{/if}
						</li>
						<li>
							<span class="step-title">{a.step2}</span>
							<form method="POST" action="?/draw" use:enhance={submit} onsubmit={confirmDraw}>
								<button
									class="btn"
									class:btn-cream={anyInvited && ready === total}
									class:btn-ghost={!(anyInvited && ready === total)}
									type="submit"
									disabled={busy || total < 3}
								>
									{busy ? t.common.wait : a.drawButton}
								</button>
							</form>
							{#if total < 3}<small>{a.needThree}</small>{/if}
						</li>
					</ol>
					{#if form && 'invited' in form && typeof form.sent === 'number'}
						<p class="note">
							{a.sentReport(form.sent, form.failed ?? [])}
						</p>
					{/if}
					<small>{t.common.nobodySees}</small>
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
	.video-card {
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.video-card .muted {
		margin: 0;
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
