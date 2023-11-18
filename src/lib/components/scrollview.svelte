<script lang="ts">
	import type { DraggableEvent } from '../actions/drag';
	import Scrollbar from './scrollbar.svelte';

	export let width: number | undefined = undefined;
	export let height: number | undefined = undefined;

	let contentElement: HTMLElement;
	let contentWidth = 0;
	let contentHeight = 0;
	let viewportWidth = 0;
	let viewportHeight = 0;

	function onVerticalDrag(e: Event) {
		const event = e as CustomEvent<DraggableEvent>;
		console.log(event.detail.yOffset);
	}

	function onHorizontalDrag(e: Event) {
		const event = e as CustomEvent<DraggableEvent>;
		console.log(event.detail.xOffset);
	}
</script>

<scrollview
	class="scrollview"
	style:width={`${width}px`}
	style:height={`${height}px`}
	bind:clientWidth={viewportWidth}
	bind:clientHeight={viewportWidth}
>
	<content
		bind:this={contentElement}
		bind:clientWidth={contentWidth}
		bind:clientHeight={contentHeight}
	>
		<slot />
	</content>
	<Scrollbar direction="vertical" on:drag-move={onVerticalDrag} />
	<Scrollbar direction="horizontal" isPair={true} on:drag-move={onHorizontalDrag} />
</scrollview>
