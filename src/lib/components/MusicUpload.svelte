<script lang="ts">
	import { upload } from '@vercel/blob/client';
	import { applyAction, deserialize, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { Messages } from '#lib/i18n/index.ts';

	/**
	 * Caricamento della musica di sottofondo, come il video:
	 * - "blob": il browser carica su Vercel Blob (`video/<eventId>/music.*`), poi `?/music` verifica;
	 * - "local" (solo sviluppo): il file passa da `?/musicLocal`.
	 */
	let {
		t,
		mode,
		eventId,
		adminToken,
		musicUrl
	}: {
		t: Messages['admin']['music'];
		mode: 'blob' | 'local' | 'none';
		eventId: string;
		adminToken: string;
		musicUrl: string | null;
	} = $props();

	const MAX = 15 * 1024 * 1024;
	const EXT: Record<string, string> = {
		'audio/mpeg': 'mp3',
		'audio/mp3': 'mp3',
		'audio/mp4': 'm4a',
		'audio/x-m4a': 'm4a',
		'audio/aac': 'aac',
		'audio/ogg': 'ogg',
		'audio/wav': 'wav',
		'audio/x-wav': 'wav',
		'audio/webm': 'weba'
	};

	let status = $state<'idle' | 'uploading' | 'saving'>('idle');
	let progress = $state(0);
	let error = $state<string | null>(null);
	let input = $state<HTMLInputElement>();

	async function postAction(action: string, body: FormData) {
		const res = await fetch(`?/${action}`, {
			method: 'POST',
			body,
			headers: { 'x-sveltekit-action': 'true' }
		});
		const result = deserialize(await res.text());
		if (result.type === 'success') await invalidateAll();
		await applyAction(result);
	}

	async function onFile() {
		const picked = input?.files?.[0];
		error = null;
		if (!picked) return;
		try {
			// Alcuni browser chiamano gli MP3 "audio/mp3": si normalizza al tipo standard.
			const type = picked.type === 'audio/mp3' ? 'audio/mpeg' : picked.type;
			const ext = EXT[type];
			if (!ext) throw new Error(t.format);
			if (picked.size > MAX) throw new Error(t.tooBig);
			const file = type === picked.type ? picked : new File([picked], picked.name, { type });

			const body = new FormData();
			if (mode === 'blob') {
				status = 'uploading';
				progress = 0;
				const blob = await upload(`video/${eventId}/music.${ext}`, file, {
					access: 'public',
					contentType: type,
					handleUploadUrl: `/evento/${adminToken}/video`,
					onUploadProgress: ({ percentage }) => (progress = Math.round(percentage))
				}).catch(() => {
					throw new Error(t.failed);
				});
				status = 'saving';
				body.set('url', blob.url);
				await postAction('music', body);
			} else {
				status = 'saving';
				body.set('music', file);
				await postAction('musicLocal', body);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : t.failed;
		} finally {
			status = 'idle';
			if (input) input.value = '';
		}
	}
</script>

<div class="music">
	{#if musicUrl}
		<audio class="preview" src={musicUrl} controls preload="none" aria-label={t.preview}></audio>
	{/if}

	{#if mode === 'none'}
		<p class="muted">{t.unavailable}</p>
	{:else}
		<div class="actions">
			<label class="btn btn-pine pick" class:disabled={status !== 'idle'}>
				{status === 'uploading'
					? t.uploading(progress)
					: status === 'saving'
						? t.saving
						: musicUrl
							? t.change
							: t.choose}
				<input
					bind:this={input}
					class="sr-only"
					type="file"
					accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/wav,audio/webm,.mp3,.m4a"
					disabled={status !== 'idle'}
					onchange={onFile}
				/>
			</label>
			{#if musicUrl && status === 'idle'}
				<form method="POST" action="?/removeMusic" use:enhance>
					<button class="text-btn" type="submit">{t.remove}</button>
				</form>
			{/if}
		</div>
		{#if status === 'uploading'}
			<div
				class="bar"
				role="progressbar"
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={progress}
			>
				<span style:width="{progress}%"></span>
			</div>
		{/if}
		<small class="muted">{t.limits}</small>
	{/if}
	{#if error}<p class="err" role="alert">{error}</p>{/if}
</div>

<style>
	.music {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.preview {
		width: 100%;
		min-height: 44px;
	}
	.muted {
		margin: 0;
		font-size: 14px;
		color: var(--ink-muted);
	}
	small.muted {
		font-size: 13px;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
	}
	.pick {
		cursor: pointer;
	}
	.pick:focus-within {
		outline: 3px solid var(--gold);
		outline-offset: 2px;
	}
	.pick.disabled {
		opacity: 0.7;
		cursor: default;
	}
	.text-btn {
		min-height: 44px;
		padding: 0 4px;
		border: 0;
		background: transparent;
		color: var(--holly-700);
		font: inherit;
		font-size: 14px;
		font-weight: 600;
		text-decoration: underline;
		cursor: pointer;
	}
	.bar {
		height: 8px;
		border-radius: 4px;
		background: var(--cream-200);
		overflow: hidden;
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--gold);
		transition: width 0.2s ease;
	}
	.err {
		margin: 0;
		padding: 12px 14px;
		border-radius: var(--radius-sm);
		background: var(--blush);
		color: var(--holly-700);
		font-size: 14px;
	}
</style>
