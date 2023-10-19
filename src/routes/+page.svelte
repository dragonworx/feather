<script lang="ts">
	import { onMount } from 'svelte';
	import { Checkbox } from '$lib/components/checkbox';
	import { Button } from '$lib/components/button';
	import { StringList } from '$lib/components/list';
	import { Debug } from '$lib/components/debug';
	import type { ButtonBehaviorEvents } from '$lib/behaviors/button';
	import type { ContextMenuBehaviorEvents } from '$lib/behaviors/contextMenu';
	import {
		DragBehavior,
		type DragBehaviorEvent,
		type DragBehaviorEvents
	} from '$lib/behaviors/drag';

	console.clear();

	let main: HTMLElement;
	let button1 = new Button({ label: 'Button' });
	let button2 = new Button({ label: 'Button' });
	let checkbox = new Checkbox();
	// let list = new StringList(['test1', 'test2', 'test3']);

	onMount(() => {
		// mount components
		// flowLayout.addChild(button1);
		// flowLayout.addChild(button2);
		// flowLayout.addChild(checkbox);
		// flowLayout.addChild(list);
		button1.mount(main);
		button2.mount(main);
		checkbox.mount(main);
		// list.mount(main);
		// for (let i = 0; i < 50; i++) {
		// 	const debug = new Debug({ label: `${i}` });
		// 	flowLayout.addChild(debug);
		// }
		// attach to internal behavior events (requires documentation)
		// button1
		// 	.on<ButtonBehaviorEvents>('down', () => console.log('down'))
		// 	.on('up', () => console.log('up'))
		// 	.on('upOutside', () => console.log('upOutside'));
		// // add additional behavior
		// button2.addBehavior(new DragBehavior());
		// button2
		// 	.on<DragBehaviorEvents>('start', (e: CustomEvent<DragBehaviorEvent>) =>
		// 		console.log('start', e.detail)
		// 	)
		// 	.on('move', (e: CustomEvent<DragBehaviorEvent>) => console.log('move', e.detail))
		// 	.on('end', (e: CustomEvent<DragBehaviorEvent>) => console.log('end', e));
		// button2.on<ContextMenuBehaviorEvents>('context', (e: CustomEvent<DragBehaviorEvent>) => {
		// 	console.log('RightClick', e);
		// });
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
