<script lang="ts">
	import { onMount } from 'svelte';
	import { Checkbox } from '$lib/components/checkbox';
	import { Button } from '$lib/components/button';
	import { StringList } from '$lib/components/list';
	import { ButtonBehavior } from '$lib/behaviors/button';
	import { DragBehavior } from '$lib/behaviors/drag';
	import { ContextMenuBehavior } from '$lib/behaviors/contextMenu';

	console.clear();

	let main: HTMLElement;
	let button1 = new Button('Button');
	let button2 = new Button('Button');
	let checkbox = new Checkbox();
	let list = new StringList(['test1', 'test2', 'test3']);

	onMount(() => {
		button1.appendTo(main);
		button2.appendTo(main);
		checkbox.appendTo(main);
		list.appendTo(main);
		button1
			.behavior(ButtonBehavior)
			.on('down', () => console.log('down'))
			.on('up', () => console.log('up'))
			.on('upOutside', () => console.log('upOutside'));
		button2.addBehavior(new DragBehavior());
		button2
			.behavior(DragBehavior)
			.on('start', () => console.log('start'))
			.on('move', (e) => console.log('move', e))
			.on('end', (e) => console.log('end', e));
		button2.behavior(ContextMenuBehavior).on('context', (e) => {
			console.log('RightClick', e);
		});
		(window as any).button1 = button1;
		(window as any).button2 = button2;
	});
</script>

<main bind:this={main} />
