<script lang="ts">
	let { size = 28, color = 'var(--gold)' }: { size?: number; color?: string } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke={color}
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<rect x="3" y="8" width="18" height="13" rx="2" />
	<path d="M3 12h18M12 8v13M12 8c-1.5-3-5-3.5-5-1s5 1 5 1zM12 8c1.5-3 5-3.5 5-1s-5 1-5 1z" />
</svg>
