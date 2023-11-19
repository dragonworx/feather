<script lang="ts">
	import resize from '../actions/resize';

	export let width: number;
	export let height: number;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<debug
	use:resize
	style:width={`${width}px`}
	style:height={`${height}px`}
	on:click
	on:mouseenter
	on:mouseleave
/>

<style>
	debug {
		opacity: 0.5;
		display: inline-block;
		background: -webkit-radial-gradient(50% 50%, circle cover, #fe0000 0, #000000 80%);
	}
</style>
