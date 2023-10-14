<script lang="ts">
	import { onMount } from 'svelte';
	import { Checkbox } from '$lib/components/checkbox';
	import { Button } from '$lib/components/button';
	import { StringList } from '$lib/components/list';
	import type { ButtonBehaviorEvents } from '$lib/behaviors/button';
	import type { ContextMenuBehaviorEvents } from '$lib/behaviors/contextMenu';
	import {
		DragBehavior,
		type DragBehaviorEvent,
		type DragBehaviorEvents
	} from '$lib/behaviors/drag';

	console.clear();

	let main: HTMLElement;
	let button1 = new Button('Button');
	let button2 = new Button('Button');
	let checkbox = new Checkbox();
	let list = new StringList(['test1', 'test2', 'test3']);

	onMount(() => {
		// mount components
		button1.mount(main);
		button2.mount(main);
		checkbox.mount(main);
		list.mount(main);

		// attach to internal behavior events (requires documentation)
		button1
			.on<ButtonBehaviorEvents>('down', () => console.log('down'))
			.on('up', () => console.log('up'))
			.on('upOutside', () => console.log('upOutside'));

		// add additional behavior
		button2.addBehavior(new DragBehavior());
		button2
			.on<DragBehaviorEvents>('start', (e: CustomEvent<DragBehaviorEvent>) =>
				console.log('start', e.detail)
			)
			.on('move', (e: CustomEvent<DragBehaviorEvent>) => console.log('move', e.detail))
			.on('end', (e: CustomEvent<DragBehaviorEvent>) => console.log('end', e));
		button2.on<ContextMenuBehaviorEvents>('context', (e: CustomEvent<DragBehaviorEvent>) => {
			console.log('RightClick', e);
		});

		// debug
		(window as any).button1 = button1;
		(window as any).button2 = button2;
	});
</script>

<main bind:this={main} />
