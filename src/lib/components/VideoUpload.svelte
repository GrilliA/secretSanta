<script lang="ts">
	import { upload } from '@vercel/blob/client';
	import { applyAction, deserialize, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { Messages } from '#lib/i18n/index.ts';

	/**
	 * Caricamento del video di sfondo dell'evento.
	 * - mode "blob": il browser carica direttamente su Vercel Blob (con barra di avanzamento),
	 *   poi l'action `?/video` verifica il file e lo collega all'evento.
	 * - mode "local" (solo sviluppo): il file passa dall'action `?/videoLocal`.
	 */
	let {
		t,
		mode,
		eventId,
		adminToken,
		videoUrl,
		videoPoster,
		slot,
		label,
		hint
	}: {
		t: Messages['admin']['video'];
		mode: 'blob' | 'local' | 'none';
		eventId: string;
		adminToken: string;
		videoUrl: string | null;
		videoPoster: string | null;
		slot: 'desktop' | 'mobile';
		label: string;
		hint: string;
	} = $props();

	const MAX = 40 * 1024 * 1024;
	const TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

	let status = $state<'idle' | 'uploading' | 'saving'>('idle');
	let progress = $state(0);
	let error = $state<string | null>(null);
	let input = $state<HTMLInputElement>();

	/** Fotogramma a ~0,5 s come JPEG (max 960 px di larghezza) da mostrare mentre il video carica. */
	function makePoster(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const url = URL.createObjectURL(file);
			const video = document.createElement('video');
			video.muted = true;
			video.playsInline = true;
			video.preload = 'auto';
			video.src = url;
			const fail = () => {
				URL.revokeObjectURL(url);
				reject(new Error('unreadable'));
			};
			video.onerror = fail;
			video.onloadedmetadata = () => {
				video.currentTime = Math.min(0.5, (video.duration || 1) / 2);
			};
			video.onseeked = () => {
				const scale = Math.min(1, 960 / (video.videoWidth || 960));
				const canvas = document.createElement('canvas');
				canvas.width = Math.round((video.videoWidth || 960) * scale);
				canvas.height = Math.round((video.videoHeight || 540) * scale);
				const ctx = canvas.getContext('2d');
				if (!ctx) return fail();
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
				let data = canvas.toDataURL('image/jpeg', 0.72);
				if (data.length > 380_000) data = canvas.toDataURL('image/jpeg', 0.45);
				URL.revokeObjectURL(url);
				resolve(data);
			};
		});
	}

	async function postAction(action: string, body: FormData) {
		const res = await fetch(`?/${action}`, {
			method: 'POST',
			body,
			headers: { 'x-sveltekit-action': 'true' }
		});
		const result = deserialize(await res.text());
		if (result.type === 'success') await invalidateAll();
		await applyAction(result);
		return result.type === 'success';
	}

	async function onFile() {
		const file = input?.files?.[0];
		error = null;
		if (!file) return;
		try {
			if (!TYPES.includes(file.type)) throw new Error(t.format);
			if (file.size > MAX) throw new Error(t.tooBig);

			const poster = await makePoster(file).catch(() => {
				throw new Error(t.unreadable);
			});

			const body = new FormData();
			body.set('poster', poster);
			body.set('slot', slot);
			if (mode === 'blob') {
				status = 'uploading';
				progress = 0;
				const ext =
					file.type === 'video/webm' ? 'webm' : file.type === 'video/quicktime' ? 'mov' : 'mp4';
				const blob = await upload(`video/${eventId}/${slot}.${ext}`, file, {
					access: 'public',
					contentType: file.type,
					handleUploadUrl: `/evento/${adminToken}/video`,
					multipart: file.size > 8 * 1024 * 1024,
					onUploadProgress: ({ percentage }) => (progress = Math.round(percentage))
				}).catch(() => {
					throw new Error(t.failed);
				});
				status = 'saving';
				body.set('url', blob.url);
				await postAction('video', body);
			} else {
				status = 'saving';
				body.set('video', file);
				await postAction('videoLocal', body);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : t.failed;
		} finally {
			status = 'idle';
			if (input) input.value = '';
		}
	}
</script>

<div class="video" class:mobile={slot === 'mobile'}>
	<div class="head">
		<h3>{label}</h3>
		<span class="muted">{hint}</span>
	</div>

	{#if videoUrl}
		<video
			class="preview"
			src={videoUrl}
			poster={videoPoster ?? undefined}
			muted
			loop
			autoplay
			playsinline
			preload="metadata"
			aria-label={t.preview}
		></video>
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
						: videoUrl
							? t.change
							: t.choose}
				<input
					bind:this={input}
					class="sr-only"
					type="file"
					accept="video/mp4,video/webm,video/quicktime"
					disabled={status !== 'idle'}
					onchange={onFile}
				/>
			</label>
			{#if videoUrl && status === 'idle'}
				<form method="POST" action="?/removeVideo" use:enhance>
					<input type="hidden" name="slot" value={slot} />
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
	.video {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.video + :global(.video) {
		padding-top: 16px;
		border-top: 1px dashed var(--sand);
	}
	.head {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	h3 {
		margin: 0;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 600;
		color: var(--ink);
	}
	.mobile .preview {
		aspect-ratio: 9 / 16;
		max-height: 280px;
		width: auto;
		align-self: flex-start;
	}
	.muted {
		margin: 0;
		font-size: 14px;
		color: var(--ink-muted);
	}
	small.muted {
		font-size: 13px;
	}
	.preview {
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		border-radius: var(--radius-sm);
		background: var(--pine);
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
