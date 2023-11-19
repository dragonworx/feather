<script lang="ts">
	import type { DraggableEvent } from '../actions/drag';
	import observe from '../actions/observe';
	import { getCssVarAsNumber } from '../util';
	import Scrollbar from './scrollbar.svelte';

	export let width: number | undefined = undefined;
	export let height: number | undefined = undefined;

	let contentElement: HTMLElement;
	let viewportElement: HTMLElement;

	export let contentWidth = 0;
	export let contentHeight = 0;
	export let viewportWidth = 0;
	export let viewportHeight = 0;
	export let offsetX = 0;
	export let offsetY = 0;

	$: cw = contentWidth;
	$: ch = contentHeight;
	$: vw = viewportWidth;
	$: vh = viewportHeight;
	$: ox = offsetX;
	$: oy = offsetY;

	$: isValid = cw > 0 && ch > 0 && vw > 0 && vh > 0;
	$: isVerticalEnabled = isValid && ch > vh;
	$: isHorizontalEnabled = isValid && cw > vw;

	const scrollSize = getCssVarAsNumber('--scroll-bar-size');

	function onHorizontalDrag(event: Event) {
		const {
			detail: { xOffset }
		} = event as CustomEvent<DraggableEvent>;
		const overflow = cw - vh + (isVerticalEnabled ? scrollSize : 0);
		contentElement.style.left = `${overflow * xOffset * -1}px`;
	}

	function onVerticalDrag(event: Event) {
		const {
			detail: { yOffset }
		} = event as CustomEvent<DraggableEvent>;
		const overflow = ch - vh;
		contentElement.style.top = `${overflow * yOffset * -1}px`;
	}

	function onContentChange(event: Event) {
		const {
			detail: { width, height }
		} = event as CustomEvent<{ width: number; height: number }>;

		contentWidth = width;
		contentHeight = height;
		cw = width;
		ch = height;

		const xOffset = ox / width;
		const overflow = width - vh + (isVerticalEnabled ? scrollSize : 0);
		contentElement.style.left = `${overflow * xOffset * -1}px`;

		const yOffset = oy / height;
		const overflowY = height - vh + (isHorizontalEnabled ? scrollSize : 0);
		contentElement.style.top = `${overflowY * yOffset * -1}px`;
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
		const overflowX = cw - vw;
		const overflowY = ch - vh;
		const viewportBounds = viewportElement.getBoundingClientRect();
		const contentBounds = contentElement.getBoundingClientRect();
		let xOffset = (viewportBounds.left - contentBounds.left) / overflowX + deltaX / cw;
		let yOffset = (viewportBounds.top - contentBounds.top) / overflowY + deltaY / ch;
		xOffset = Math.max(0, Math.min(1, xOffset));
		yOffset = Math.max(0, Math.min(1, yOffset));

		onHorizontalDrag({
			detail: {
				xOffset
			}
		} as unknown as Event);

		onVerticalDrag({
			detail: {
				yOffset
			}
		} as unknown as Event);

		ox = xOffset * overflowX;
		oy = yOffset * overflowY;
	}
</script>

<scrollview
	use:observe
	bind:this={viewportElement}
	class="scrollview"
	style:width={`${width}px`}
	style:height={`${height}px`}
	on:observe-change={onViewportChange}
	on:mousewheel={onMouseWheel}
>
	<content use:observe bind:this={contentElement} on:observe-change={onContentChange}>
		<slot />
	</content>
	{#if isValid}
		{#if isVerticalEnabled}
			<Scrollbar
				direction="vertical"
				contentSize={ch}
				viewportSize={vh}
				offset={oy}
				isPair={isHorizontalEnabled}
				on:drag-move={onVerticalDrag}
			/>
		{/if}
		{#if isHorizontalEnabled}
			<Scrollbar
				direction="horizontal"
				contentSize={cw}
				viewportSize={vw}
				offset={ox}
				isPair={isVerticalEnabled}
				on:drag-move={onHorizontalDrag}
			/>
		{/if}
	{/if}
</scrollview>
