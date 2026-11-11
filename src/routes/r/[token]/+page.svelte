<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Avatar from '#lib/components/Avatar.svelte';
	import Envelope from '#lib/components/Envelope.svelte';
	import GiftIcon from '#lib/components/GiftIcon.svelte';
	import Hills from '#lib/components/Hills.svelte';
	import PlayersGarland from '#lib/components/PlayersGarland.svelte';
	import MusicPlayer from '#lib/components/MusicPlayer.svelte';
	import VideoIntro from '#lib/components/VideoIntro.svelte';
	import { formatDay } from '#lib/format.ts';
	import { getT } from '#lib/i18n/index.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let phase = $state<'closed' | 'opening' | 'revealed'>('closed');
	let introOpen = $state(false);
	const hasVideo = $derived(Boolean(data.event.videoUrl || data.event.videoMobileUrl));
	const t = $derived(getT(data.event.locale));
	const i = $derived(t.invite);
	const day = $derived(formatDay(data.event.exchangeDate, t.intlLocale));
	const ownTitle = $derived(data.managerName ? i.ownTitleManaged(data.me.name) : i.ownTitle);

	$effect(() => {
		document.documentElement.lang = t.locale;
	});
</script>

<svelte:head><title>{i.pageTitle(data.event.name)}</title></svelte:head>

<div class="page">
	<VideoIntro
		bind:open={introOpen}
		desktop={data.event.videoUrl
			? { src: data.event.videoUrl, poster: data.event.videoPoster }
			: null}
		mobile={data.event.videoMobileUrl
			? { src: data.event.videoMobileUrl, poster: data.event.videoMobilePoster }
			: null}
		t={i}
		storageKey="intro:{page.params.token}:{data.event.videoUrl ?? ''}{data.event.videoMobileUrl ??
			''}"
	/>
	{#if data.event.musicUrl}
		<MusicPlayer src={data.event.musicUrl} t={i} paused={introOpen} />
	{/if}

	<section class="hero snow" class:tall={data.receiver && phase !== 'revealed'}>
		<div class="container inner">
			<div class="top">
				<div class="brand"><GiftIcon size={28} color="var(--gold-300)" /> {data.event.name}</div>
				{#if data.managerName}
					<span class="pill">{i.viewingFor(data.me.name)}</span>
				{/if}
				{#if hasVideo}
					<button type="button" class="replay-intro" onclick={() => (introOpen = true)}>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
							><path
								d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"
							/></svg
						>
						{i.replayIntro}
					</button>
				{/if}
			</div>

			<PlayersGarland players={data.players} t={i} showReady={!data.receiver} dark />

			{#if !data.receiver}
				<div class="closed">
					<span class="lead">{i.hello(data.me.name)}</span>
					{#if data.me.ready}
						<h1 class="wait">{i.readyTitle}</h1>
						<p class="wait-text">
							{i.readyText(data.event.organizerName)}
						</p>
					{:else}
						<h1 class="wait">{i.writeTitle}</h1>
						<p class="wait-text">
							{i.writeText}
						</p>
					{/if}
				</div>
			{:else if phase !== 'revealed'}
				<div class="closed">
					<span class="lead">{i.envelopeFor(data.me.name)}</span>
					<Envelope
						opening={phase === 'opening'}
						onopened={() => (phase = 'revealed')}
						letter={i.envelopeLetter}
					/>
					<button
						class="btn btn-cream"
						type="button"
						disabled={phase === 'opening'}
						onclick={() => (phase = 'opening')}>{i.open}</button
					>
				</div>
			{:else}
				<div class="reveal" aria-live="polite">
					<span class="lead fadein">{i.youGiftTo(data.me.name)}</span>
					<div class="who">
						<div class="face pop">
							<Avatar
								name={data.receiver.name}
								photoId={data.receiver.photoId}
								size={176}
								tone="pine"
								alt={i.photoOf(data.receiver.name)}
							/>
						</div>
						<div class="who-text">
							<h1 class="fadein late">{data.receiver.name}</h1>
							<div class="facts fadein late">
								{#if data.event.budget}<span>{t.common.budget} {data.event.budget}</span>{/if}
								{#if day}<span>{t.common.exchangeOn(day)}</span>{/if}
								<button type="button" class="replay" onclick={() => (phase = 'closed')}>
									{i.reopen}
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
		<main class="container lists fadein late" class:stacked={data.receiver}>
			{#if data.receiver}
				<section class="card">
					<h2>{i.wishesOf(data.receiver.name)}</h2>
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
						<p class="muted">{i.noWishes}</p>
					{/if}
					<p class="secret">{i.secret(data.receiver.name)}</p>
				</section>
			{/if}

			{#snippet ownList()}
				<p class="muted">
					{data.managerName ? i.ownHintManaged(data.me.name) : i.ownHint}
				</p>
				{#if data.me.wishes.length}
					<ul class="wishes">
						{#each data.me.wishes as w (w.id)}
							<li>
								<span class="wish-text">{w.text}</span>
								<form method="POST" action="?/removeWish" use:enhance>
									<input type="hidden" name="id" value={w.id} />
									<button type="submit" class="icon-btn" aria-label={i.removeWish(w.text)}>
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
					<label class="sr-only" for="wish">{i.addWish}</label>
					<input
						id="wish"
						name="text"
						class="input"
						placeholder={i.addWishPlaceholder}
						maxlength="140"
						required
					/>
					<button class="btn btn-pine" type="submit">{t.common.add}</button>
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
								{i.ready}
							</p>
							<button class="text-btn" type="submit">{i.notReady}</button>
						{:else}
							<button class="btn btn-primary" type="submit" disabled={data.me.wishes.length === 0}>
								{i.markReady}
							</button>
							{#if data.me.wishes.length === 0}
								<small class="muted">{i.needOne}</small>
							{/if}
						{/if}
					</form>
				{/if}
			{/snippet}

			{#if data.receiver}
				<details class="card mine">
					<summary>
						<span>
							<strong>{ownTitle}</strong>
							<small>{t.common.wishes(data.me.wishes.length)}</small>
						</span>
						<span class="edit">{i.edit}</span>
					</summary>
					{@render ownList()}
				</details>
			{:else}
				<section class="card">
					<h2>{ownTitle}</h2>
					{@render ownList()}
				</section>
			{/if}
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
	.replay-intro {
		margin-left: auto;
		min-height: 40px;
		padding: 0 14px;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		border-radius: 999px;
		border: 1.5px solid rgba(255, 255, 255, 0.5);
		background: rgba(0, 0, 0, 0.15);
		color: var(--cream);
		font: inherit;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
	}
	.replay-intro:hover {
		background: rgba(0, 0, 0, 0.3);
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
	.lists.stacked {
		flex-direction: column;
		flex-wrap: nowrap;
		justify-content: flex-start;
		align-items: stretch;
		max-width: 760px;
	}
	.lists.stacked .card {
		flex: none;
	}
	.lists .card.mine {
		padding: 0;
		gap: 12px;
	}
	.mine summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-height: 64px;
		padding: 0 28px;
		cursor: pointer;
		list-style: none;
	}
	.mine summary::-webkit-details-marker {
		display: none;
	}
	.mine summary span:first-child {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.mine summary small {
		font-size: 13px;
		color: var(--ink-muted);
	}
	.mine .edit {
		font-size: 14px;
		font-weight: 600;
		color: var(--pine);
		text-decoration: underline;
	}
	.mine[open] .edit {
		visibility: hidden;
	}
	.lists .card.mine[open] {
		padding-bottom: 28px;
	}
	.mine[open] > :global(:not(summary)) {
		margin-inline: 28px;
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
