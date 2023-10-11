<script lang="ts">
	import { onMount } from 'svelte';
	import { Checkbox } from '$lib/components/checkbox';
	import { Button } from '$lib/components/button';
	import { StringList } from '$lib/components/list';
	import { RolloverBehavior } from '$lib/behaviors/rollover';

	let main: HTMLElement;
	let button = new Button('Button');
	let checkbox = new Checkbox();
	let list = new StringList(['test1', 'test2', 'test3']);

	onMount(() => {
		button.addBehavior('rollover', new RolloverBehavior());
		button.appendTo(main);
		checkbox.appendTo(main);
		list.appendTo(main);

		setInterval(() => {
			console.log(button.behavior<RolloverBehavior>('rollover')?.isOver);
		}, 1000);

		(window as any).button = button;
	});
</script>

<main bind:this={main} />
