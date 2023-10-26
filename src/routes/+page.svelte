<script lang="ts">
	import { onMount } from 'svelte';
	// import { Checkbox } from '$lib/controls/checkbox';
	// import { Button } from '$lib/controls/button';
	// import { StringList } from '$lib/controls/list';
	// import { Debug } from '$lib/controls/debug';
	// import { Panel } from '$lib/controls/panel';
	// import { ButtonBehavior, type ButtonBehaviorEvent } from '$lib/behaviors/button';
	// import { ContextMenuBehavior, type ContextMenuBehaviorEvents } from '$lib/behaviors/contextMenu';
	// import {
	// 	DragBehavior,
	// 	type DragBehaviorEvent,
	// 	type DragBehaviorEvents
	// } from '$lib/behaviors/drag';

	// import { test } from '$lib/new/test';
	import { test } from '$lib/new/test';

	// force full reload on hot module reload
	if (import.meta.hot) {
		import.meta.hot.accept(() => {
			import.meta.hot!.invalidate();
		});
	}

	// console.clear();

	let main: HTMLElement;

	// let list = new StringList(['test1', 'test2', 'test3']);

	// todo: rename to Control? Ctrl?

	onMount(() => {
		// const panel = new Panel();
		// const button1 = new Button({ label: 'Button' });
		// const button2 = new Button({ label: 'Button' });
		// const checkbox = new Checkbox();

		// // mount components
		// panel.mount(main);
		// panel.addChild(button1);
		// panel.addChild(button2);
		// panel.addChild(checkbox);
		// // button1.mount(main);
		// // button2.mount(main);
		// // checkbox.mount(main);
		// // list.mount(main);
		// for (let i = 0; i < 5; i++) {
		// 	const debug = new Debug({ label: `${i}` });
		// 	panel.addChild(debug);
		// }

		// // attach to internal behavior events (requires documentation)
		// button1
		// 	.on('down', () => console.log('down'))
		// 	.on('up', () => console.log('up'))
		// 	.on('upOutside', () => console.log('upOutside'))
		// 	.on('longPress', () => console.log('longPress'));

		// // modify button2 behavior
		// button2.isToggle = true;

		// // add additional behavior
		// const drag = new DragBehavior();
		// button2.addBehavior(drag);
		// drag
		// 	.on('start', (e: CustomEvent<DragBehaviorEvent>) => console.log('start', e.detail))
		// 	.on('move', (e: CustomEvent<DragBehaviorEvent>) => console.log('move', e.detail))
		// 	.on('end', (e: CustomEvent<DragBehaviorEvent>) => console.log('end', e));
		// button2.contextMenuBehavior.on('context', (e: CustomEvent<DragBehaviorEvent>) => {
		// 	console.log('context', e);
		// });

		// (window as any).button1 = button1;
		// (window as any).button2 = button2;

		test();
	});
</script>

<main>
	<div bind:this={main} />
</main>

<style>
	main {
		width: 100%;
		height: 100%;
	}
</style>
