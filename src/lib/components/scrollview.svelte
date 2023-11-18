<script lang="ts">
	import type { DraggableEvent } from '../actions/drag';
	import observe from '../actions/observe';
	import Scrollbar from './scrollbar.svelte';

	export let width: number | undefined = undefined;
	export let height: number | undefined = undefined;

	let contentElement: HTMLElement;

	export let contentWidth = 0;
	export let contentHeight = 0;
	export let viewportWidth = 0;
	export let viewportHeight = 0;

	$: cw = contentWidth;
	$: ch = contentHeight;
	$: vw = viewportWidth;
	$: vh = viewportHeight;

	$: isValid = cw > 0 && ch > 0 && vw > 0 && vh > 0;
	$: isVerticalEnabled = isValid && ch > vh;
	$: isHorizontalEnabled = isValid && cw > vw;

	$: console.log(ch, vh);

	function onVerticalDrag(event: Event) {
		const {
			detail: { yOffset }
		} = event as CustomEvent<DraggableEvent>;
		const overflow = ch - vh;
		console.log(yOffset);
		contentElement.style.top = `${overflow * yOffset * -1}px`;
	}

	function onHorizontalDrag(event: Event) {
		const {
			detail: { xOffset }
		} = event as CustomEvent<DraggableEvent>;
		const overflow = cw - vh;
		console.log(xOffset);
		contentElement.style.left = `${overflow * xOffset * -1}px`;
	}

	function onViewportChange(event: Event) {
		const {
			detail: { width, height }
		} = event as CustomEvent<{ width: number; height: number }>;
		console.log('viewport', width, height);
		viewportWidth = width;
		viewportHeight = height;
	}

	function onContentChange(event: Event) {
		const {
			detail: { width, height }
		} = event as CustomEvent<{ width: number; height: number }>;
		console.log('content', width, height);
		contentWidth = width;
		contentHeight = height;
	}
</script>

<scrollview
	use:observe
	class="scrollview"
	style:width={`${width}px`}
	style:height={`${height}px`}
	on:observe-change={onViewportChange}
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
				isPair={isHorizontalEnabled}
				on:drag-move={onVerticalDrag}
			/>
		{/if}
		{#if isHorizontalEnabled}
			<Scrollbar
				direction="horizontal"
				contentSize={cw}
				viewportSize={vw}
				isPair={isVerticalEnabled}
				on:drag-move={onHorizontalDrag}
			/>
		{/if}
	{/if}
</scrollview>
