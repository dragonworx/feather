<script lang="ts">
	import { onMount } from 'svelte';
	import { Checkbox } from '../lib/checkbox';
	import { Button } from '../lib/button';
	import { StringList } from '../lib/list';

	let main: HTMLElement;
	let button = new Button('Button');
	let checkbox = new Checkbox();
	let list = new StringList(['test1', 'test2', 'test3']);

	onMount(() => {
		button.on('click', () => (checkbox.value = !checkbox.value));

		button.appendTo(main);
		checkbox.appendTo(main);
		list.appendTo(main);
	});
</script>

<main bind:this={main} />
