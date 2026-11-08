<script lang="ts">
	let { size = 18, color = 'var(--gold)' }: { size?: number; color?: string } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke={color}
	stroke-width="1.8"
	stroke-linecap="round"
	aria-hidden="true"
>
	<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5" />
</svg>
