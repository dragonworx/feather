<script lang="ts">
	import { debugSvg } from '../util';

	export let width: number;
	export let height: number;
</script>

<debug>
	{@html debugSvg(width, height)}
</debug>

<style>
	debug {
		opacity: 0.5;
		display: inline-block;
	}
</style>
