<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import GiftIcon from '#lib/components/GiftIcon.svelte';
	import Hills from '#lib/components/Hills.svelte';
	import { getT } from '#lib/i18n/index.ts';

	const t = $derived(getT(page.data.uiLocale));
	const text = $derived(
		page.status !== 404
			? (page.error?.message ?? t.notFound.generic)
			: page.route.id?.startsWith('/r/')
				? t.notFound.invite
				: page.route.id?.startsWith('/evento/')
					? t.notFound.event
					: t.notFound.generic
	);
</script>

<svelte:head><title>{page.status} · {t.home.title}</title></svelte:head>

<div class="page snow">
	<main class="container">
		<GiftIcon size={44} />
		<p class="code">{page.status}</p>
		<h1>{t.notFound.title}</h1>
		<p class="text">{text}</p>
		<a class="btn btn-cream" href={resolve('/')}>{t.notFound.home}</a>
	</main>
	<Hills />
</div>

<style>
	.page {
		position: relative;
		overflow: hidden;
		min-height: 100dvh;
		background-color: var(--pine);
		color: var(--cream);
		display: flex;
		align-items: center;
	}
	main {
		position: relative;
		padding-block: 64px 140px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		text-align: center;
	}
	.code {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 72px;
		line-height: 1;
		color: var(--gold-300);
	}
	h1 {
		font-size: clamp(28px, 4vw, 44px);
	}
	.text {
		margin: 0 0 8px;
		max-width: 32rem;
		font-size: 17px;
		line-height: 1.55;
		color: var(--mist);
	}
</style>
