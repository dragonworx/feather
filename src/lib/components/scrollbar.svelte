<script lang="ts">
	import { onMount } from 'svelte';
	import { drag, type DraggableEvent } from '../actions/drag';

	export let direction: 'horizontal' | 'vertical' = 'vertical';
	export let contentSize: number = 100;
	export let viewportSize: number = 50;
	export let offset: number = 50;

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

	function onDragMove(e: CustomEvent<DraggableEvent>) {
		const { xDelta, yDelta } = e.detail;
		if (isVertical) {
			offset += (yDelta * contentSize) / track.clientHeight;
		} else {
			offset += (xDelta * contentSize) / track.clientWidth;
		}
	}
</script>

<div
	bind:this={track}
	class="scrollbar"
	class:vertical={isVertical}
	class:horizontal={isHorizontal}
>
	<div
		bind:this={thumb}
		use:drag={{ xDistThreshold: 1, yDistThreshold: 1 }}
		class="thumb"
		on:drag-move={onDragMove}
	/>
</div>
