<script lang="ts">
	import { onMount } from 'svelte';
	import resize from '../actions/resize';

	export let width: number;
	export let height: number;
	export let stroke = '#fff';
	export let fill = 'red';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext('2d')!;

		ctx.fillStyle = fill;
		ctx.fillRect(0, 0, width, height);

		ctx.strokeStyle = stroke;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(width, height);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(0, height);
		ctx.lineTo(width, 0);
		ctx.stroke();
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<canvas
	bind:this={canvas}
	use:resize
	style:width={`${width}px`}
	style:height={`${height}px`}
	on:click
	on:mouseenter
	on:mouseleave
/>

<style>
	canvas {
		opacity: 0.5;
		display: inline-block;
	}
</style>
