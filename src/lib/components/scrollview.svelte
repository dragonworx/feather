<script lang="ts">
	import type { DraggableEvent } from '../actions/drag';
	import observe from '../actions/observe';
	import { getCssVarAsNumber, isTrackPadWheelEvent } from '../util';
	import Scrollbar from './scrollbar.svelte';

	export let width: number | undefined = undefined;
	export let height: number | undefined = undefined;
	export let autoScroll = false;
	export let autoScrollThreshold = 20;
	export let autoScrollAmount = 0.05;
	export let clip = true;

	let contentElement: HTMLElement;
	let viewportElement: HTMLElement;
	let isDragging = false;

	export let contentWidth = 0;
	export let contentHeight = 0;
	export let viewportWidth = 0;
	export let viewportHeight = 0;
	export let offsetX = 0;
	export let offsetY = 0;

	$: isValid = contentWidth > 0 && contentHeight > 0 && viewportWidth > 0 && viewportHeight > 0;
	$: isVerticalEnabled = isValid && contentHeight > viewportHeight;
	$: isHorizontalEnabled = isValid && contentWidth > viewportWidth;

	$: contentWidth, contentHeight, viewportWidth, viewportHeight, offsetX, offsetY, update();

	const scrollSize = getCssVarAsNumber('--scroll-bar-size');

	function update() {
		if (!isValid) {
			return;
		}

		const overflowX = contentWidth - viewportHeight + (isVerticalEnabled ? scrollSize : 0);
		const overflowY = contentHeight - viewportHeight;
		const xOffset = Math.max(0, Math.min(1, offsetX / overflowX));
		const yOffset = Math.max(0, Math.min(1, offsetY / overflowY));

		contentElement.style.left = `${overflowX * xOffset * -1}px`;
		contentElement.style.top = `${overflowY * yOffset * -1}px`;
	}

	function onDragStart() {
		isDragging = true;
	}

	function onDragEnd() {
		isDragging = false;
	}

	function onContentChange(event: Event) {
		const {
			detail: { width, height }
		} = event as CustomEvent<{ width: number; height: number }>;

		contentWidth = width;
		contentHeight = height;
	}

	function onViewportChange(event: Event) {
		const {
			detail: { width, height }
		} = event as CustomEvent<{ width: number; height: number }>;

		viewportWidth = width;
		viewportHeight = height;
	}

	function onMouseWheel(event: WheelEvent) {
		const { deltaX, deltaY } = event;
		const overflowX = contentWidth - viewportWidth;
		const overflowY = contentHeight - viewportHeight;
		const viewportBounds = viewportElement.getBoundingClientRect();
		const contentBounds = contentElement.getBoundingClientRect();

		let xOffset = (viewportBounds.left - contentBounds.left) / overflowX + deltaX / contentWidth;
		let yOffset = (viewportBounds.top - contentBounds.top) / overflowY + deltaY / contentHeight;

		xOffset = Math.max(0, Math.min(1, xOffset));
		yOffset = Math.max(0, Math.min(1, yOffset));

		if (deltaX !== 0 && isHorizontalEnabled) {
			offsetX = xOffset * overflowX;
		}

		if (deltaY !== 0 && isVerticalEnabled) {
			offsetY = yOffset * overflowY;
		}

		if (isTrackPadWheelEvent(event)) {
			isDragging = true;
		}

		if ((isDragging && deltaX > 1) || deltaY > 1) {
			setTimeout(() => (isDragging = false), 100);
		}
	}

	let timeout = 0;

	function onMouseMove(event: MouseEvent) {
		if (!autoScroll) {
			return;
		}

		// clear previous timeout
		clearTimeout(timeout);

		// adjust bounds for scrollbars
		const viewportBounds = viewportElement.getBoundingClientRect();
		viewportBounds.width = isVerticalEnabled
			? viewportBounds.width - scrollSize
			: viewportBounds.width;
		viewportBounds.height = isHorizontalEnabled
			? viewportBounds.height - scrollSize
			: viewportBounds.height;

		const { clientX, clientY } = event;

		if (
			clientX < viewportBounds.left ||
			clientX > viewportBounds.right ||
			clientY < viewportBounds.top ||
			clientY > viewportBounds.bottom
		) {
			return;
		}

		// determine scroll behavior from mouse position
		const localX = clientX - viewportBounds.left;
		const localY = clientY - viewportBounds.top;
		const autoScrollBounds = new DOMRectReadOnly(
			autoScrollThreshold,
			autoScrollThreshold,
			viewportBounds.width - autoScrollThreshold * 2,
			viewportBounds.height - autoScrollThreshold * 2
		);
		const isAutoScrollingUp = localY < autoScrollBounds.top;
		const isAutoScrollingDown = localY > autoScrollBounds.bottom;
		const isAutoScrollingLeft = localX < autoScrollBounds.left;
		const isAutoScrollingRight = localX > autoScrollBounds.right;

		// handle up
		if (isAutoScrollingUp) {
			const scrollStrength = (autoScrollBounds.top - localY) / autoScrollThreshold;
			const scrollDistance = contentHeight * autoScrollAmount * scrollStrength * -1;
			onMouseWheel({
				deltaX: 0,
				deltaY: scrollDistance
			} as WheelEvent);
		}

		// handle down
		if (isAutoScrollingDown) {
			const scrollStrength = (localY - autoScrollBounds.bottom) / autoScrollThreshold;
			const scrollDistance = contentHeight * autoScrollAmount * scrollStrength;
			onMouseWheel({
				deltaX: 0,
				deltaY: scrollDistance
			} as WheelEvent);
		}

		// handle left
		if (isAutoScrollingLeft) {
			const scrollStrength = (autoScrollBounds.left - localX) / autoScrollThreshold;
			const scrollDistance = contentWidth * autoScrollAmount * scrollStrength * -1;
			onMouseWheel({
				deltaX: scrollDistance,
				deltaY: 0
			} as WheelEvent);
		}

		// handle right
		if (isAutoScrollingRight) {
			const scrollStrength = (localX - autoScrollBounds.right) / autoScrollThreshold;
			const scrollDistance = contentWidth * autoScrollAmount * scrollStrength;
			onMouseWheel({
				deltaX: scrollDistance,
				deltaY: 0
			} as WheelEvent);
		}

		// continue auto scrolling
		timeout = setTimeout(() => {
			onMouseMove({
				clientX,
				clientY
			} as MouseEvent);
		}, 100) as unknown as number;
	}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<scrollview
	use:observe
	bind:this={viewportElement}
	class="scrollview"
	class:clip
	style:width={`${width}px`}
	style:height={`${height}px`}
	on:observe-change={onViewportChange}
	on:mousewheel={onMouseWheel}
	on:mousemove={onMouseMove}
>
	<content
		use:observe
		bind:this={contentElement}
		on:observe-change={onContentChange}
		class:no-transition={isDragging}
	>
		<slot />
	</content>

	{#if isValid}
		{#if isVerticalEnabled}
			<Scrollbar
				bind:contentSize={contentHeight}
				bind:viewportSize={viewportHeight}
				bind:offset={offsetY}
				direction="vertical"
				isPair={isHorizontalEnabled}
				on:drag-start={onDragStart}
				on:drag-end={onDragEnd}
			/>
		{/if}

		{#if isHorizontalEnabled}
			<Scrollbar
				bind:contentSize={contentWidth}
				bind:viewportSize={viewportWidth}
				bind:offset={offsetX}
				direction="horizontal"
				isPair={isVerticalEnabled}
				on:drag-start={onDragStart}
				on:drag-end={onDragEnd}
			/>
		{/if}
	{/if}
</scrollview>
