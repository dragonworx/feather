<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { drag } from '../actions/drag';

	export let direction: 'horizontal' | 'vertical' = 'vertical';
	export let contentSize: number = 0;
	export let viewportSize: number = 0;
	export let offset: number = 0;
	export let isPair = false;

	const dispatch = createEventDispatcher();

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

	function onMouseDown(e: MouseEvent) {
		const overflow = contentSize - viewportSize;
		const trackBounds = track.getBoundingClientRect();
		const thumbBounds = thumb.getBoundingClientRect();
		const localMouseX = e.clientX - trackBounds.left;
		const localMouseY = e.clientY - trackBounds.top;

		if (direction === 'horizontal') {
			const isLeft = localMouseX < thumbBounds.left - trackBounds.left;
			const isRight = localMouseX > thumbBounds.right - trackBounds.left;
			if (isRight) {
				offset = Math.min(Math.max(0, offset + viewportSize), overflow);
			} else if (isLeft) {
				offset = Math.min(Math.max(0, offset - viewportSize), overflow);
			}
			const xOffset = offset / overflow;
			thumb.dispatchEvent(
				new CustomEvent('drag-move', {
					detail: {
						xOffset
					}
				})
			);
		} else {
			const isTop = localMouseY < thumbBounds.top - trackBounds.top;
			const isBottom = localMouseY > thumbBounds.bottom - trackBounds.top;
			if (isTop) {
				offset = Math.min(Math.max(0, offset - viewportSize), overflow);
			} else if (isBottom) {
				offset = Math.min(Math.max(0, offset + viewportSize), overflow);
			}
			const yOffset = offset / overflow;
			thumb.dispatchEvent(
				new CustomEvent('drag-move', {
					detail: {
						yOffset
					}
				})
			);
		}
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	bind:this={track}
	class="scrollbar"
	class:vertical={isVertical}
	class:horizontal={isHorizontal}
	class:pair={isPair}
	on:mousedown={onMouseDown}
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
