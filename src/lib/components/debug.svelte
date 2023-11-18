<script lang="ts">
	import { debugSvg } from '../util';

	export let width: number;
	export let height: number;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<debug style:width={`${width}px`} style:height={`${height}px`} on:click on:mouseenter on:mouseleave>
	{@html debugSvg(width, height)}
</debug>

<style>
	debug {
		opacity: 0.5;
		display: inline-block;
		background: red;
	}
</style>
