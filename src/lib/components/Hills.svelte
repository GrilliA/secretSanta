<script lang="ts">
	/** Collinette innevate: separatore tra superficie scura e chiara. */
	let { height = 90 }: { height?: number } = $props();
</script>

<svg viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true" style:height="{height}px">
	<path d="M0 60 Q 240 10 480 50 T 960 40 T 1440 55 V90 H0z" fill="var(--cream)" opacity=".35" />
	<path d="M0 75 Q 300 40 620 70 T 1440 65 V90 H0z" fill="var(--cream)" />
</svg>

<style>
	svg {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		display: block;
		pointer-events: none;
	}
</style>
