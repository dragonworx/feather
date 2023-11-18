<script lang="ts">
	import { onMount } from 'svelte';
	import { drag } from '../actions/drag';

	export let direction: 'horizontal' | 'vertical' = 'vertical';
	export let contentSize: number = 0;
	export let viewportSize: number = 0;
	export let offset: number = 0;
	export let isPair = false;

	let track: HTMLElement;
	let thumb: HTMLElement;

	$: isVertical = direction === 'vertical';
	$: isHorizontal = direction === 'horizontal';
	$: contentSize, viewportSize, offset, update();

	function update() {
		if (!track || !thumb) return;

		const trackSize = isVertical ? track.clientHeight : track.clientWidth;
		const thumbSize = (trackSize * viewportSize) / contentSize;
		const thumbOffset = (trackSize * offset) / contentSize;

		thumb.style[isVertical ? 'height' : 'width'] = `${thumbSize}px`;
		thumb.style[isVertical ? 'top' : 'left'] = `${thumbOffset}px`;
	}

	onMount(update);
</script>

<div
	bind:this={track}
	class="scrollbar"
	class:vertical={isVertical}
	class:horizontal={isHorizontal}
	class:pair={isPair}
>
	<div
		bind:this={thumb}
		use:drag={{
			direction: isVertical ? 'vertical' : 'horizontal',
			constrain: true
		}}
		class="thumb"
		on:drag-move
	/>
</div>
