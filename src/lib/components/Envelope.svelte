<script lang="ts">
	import Snowflake from './Snowflake.svelte';

	/**
	 * Busta animata: chiusa (dondola) → `opening` (sigillo, lembo, biglietto) → `onopened`.
	 */
	let {
		opening = false,
		onopened,
		letter = 'Quest’anno fai il regalo a…'
	}: { opening?: boolean; onopened?: () => void; letter?: string } = $props();

	function handleEnd(e: AnimationEvent) {
		if (e.animationName.endsWith('away')) onopened?.();
	}
</script>

<div class="env" class:opening class:closed={!opening} onanimationend={handleEnd}>
	<div class="back"></div>
	<div class="letter">
		<span>{letter}</span>
	</div>
	<svg class="pocket" viewBox="0 0 360 240" preserveAspectRatio="none" aria-hidden="true">
		<path
			d="M0 10 Q0 0 10 0 L180 132 L350 0 Q360 0 360 10 V230 Q360 240 350 240 H10 Q0 240 0 230z"
			fill="var(--cream-200)"
		/>
		<path d="M0 240 L160 118 M360 240 L200 118" stroke="#e3d5bc" stroke-width="2" fill="none" />
	</svg>
	<div class="flap"></div>
	<div class="seal" aria-hidden="true"><Snowflake size={26} color="var(--gold-300)" /></div>
</div>

<style>
	.env {
		position: relative;
		width: 360px;
		max-width: 100%;
		height: 240px;
		perspective: 900px;
	}
	.back {
		position: absolute;
		inset: 0;
		background: #e3d5bc;
		border-radius: 10px;
	}
	.letter {
		position: absolute;
		left: 20px;
		right: 20px;
		top: 16px;
		height: 200px;
		background: #fff;
		border-radius: 8px;
		z-index: 2;
		display: flex;
		justify-content: center;
		padding-top: 28px;
		font-family: var(--font-display);
		font-style: italic;
		font-weight: 600;
		font-size: 20px;
		color: var(--holly-700);
	}
	.pocket {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 3;
	}
	.flap {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 140px;
		background: var(--cream-300);
		clip-path: polygon(0 0, 100% 0, 50% 100%);
		transform-origin: top center;
		z-index: 4;
	}
	.seal {
		position: absolute;
		left: 50%;
		top: 112px;
		width: 52px;
		height: 52px;
		margin-left: -26px;
		border-radius: 26px;
		background: var(--holly);
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 0 var(--holly-800);
	}
	.closed {
		animation: wiggle 2.4s ease-in-out infinite;
	}
	.opening .seal {
		animation: seal 0.35s ease forwards;
	}
	.opening .flap {
		animation: flap 0.6s 0.3s ease forwards;
	}
	.opening .letter {
		animation: rise 0.8s 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
	}
	.opening {
		animation: away 0.45s 1.65s ease forwards;
	}
	@keyframes seal {
		to {
			transform: scale(1.25);
			opacity: 0;
		}
	}
	@keyframes flap {
		0% {
			transform: rotateX(0);
		}
		49% {
			z-index: 4;
		}
		50% {
			z-index: 1;
		}
		100% {
			transform: rotateX(180deg);
			z-index: 1;
		}
	}
	@keyframes rise {
		to {
			transform: translateY(-120px);
		}
	}
	@keyframes away {
		to {
			opacity: 0;
			transform: scale(1.08);
		}
	}
	@keyframes wiggle {
		0%,
		80%,
		100% {
			transform: rotate(0);
		}
		85% {
			transform: rotate(-2deg);
		}
		90% {
			transform: rotate(2deg);
		}
		95% {
			transform: rotate(-1deg);
		}
	}
</style>
