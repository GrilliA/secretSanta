<script lang="ts">
	/** Palline appese decorative. `tone` cambia il colore della pallina principale. */
	let { tone = 'holly' }: { tone?: 'holly' | 'pine' } = $props();
	const main = $derived(tone === 'holly' ? 'var(--holly)' : 'var(--pine)');
	const dot = $derived(tone === 'holly' ? 'var(--holly)' : 'var(--pine)');
</script>

<svg class="baubles" width="300" height="170" viewBox="0 0 300 170" aria-hidden="true">
	<path d="M50 0v74" stroke="var(--gold)" stroke-width="1.5" />
	<rect x="44" y="70" width="12" height="9" rx="2" fill="var(--gold)" />
	<circle cx="50" cy="100" r="22" fill={main} />
	<path d="M34 96q16 9 32 0" stroke="var(--gold-300)" stroke-width="2.5" fill="none" />

	<path d="M150 0v40" stroke="var(--gold)" stroke-width="1.5" />
	<rect x="143" y="36" width="14" height="10" rx="2" fill="var(--gold-700)" />
	<circle cx="150" cy="74" r="30" fill="var(--gold)" />
	<path
		d="M126 70q24 12 48 0M128 84q22 10 44 0"
		stroke="var(--cream)"
		stroke-width="2"
		fill="none"
	/>

	<path d="M245 0v100" stroke="var(--gold)" stroke-width="1.5" />
	<rect x="240" y="96" width="10" height="8" rx="2" fill="var(--gold)" />
	<circle cx="245" cy="121" r="17" fill="var(--cream)" />
	<circle cx="245" cy="121" r="6" fill={dot} />
</svg>

<style>
	.baubles {
		position: absolute;
		top: 0;
		right: 6%;
		pointer-events: none;
		transform-origin: top center;
		animation: sway 6s ease-in-out infinite;
	}
	@keyframes sway {
		0%,
		100% {
			transform: rotate(0deg);
		}
		50% {
			transform: rotate(1.5deg);
		}
	}
	@media (max-width: 720px) {
		.baubles {
			width: 180px;
			height: auto;
			right: 0;
			opacity: 0.7;
		}
	}
</style>
