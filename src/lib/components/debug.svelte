<script lang="ts">
	import { debugSvg } from '../util';

	export let width: number;
	export let height: number;
</script>

<debug style:width={`${width}px`} style:height={`${height}px`}>
	{@html debugSvg(width, height)}
</debug>

<style>
	debug {
		opacity: 0.5;
		display: inline-block;
		background: red;
	}
</style>
