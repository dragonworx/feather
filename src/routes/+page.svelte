<script lang="ts">
	import { onMount } from 'svelte';
	import { Checkbox } from '$lib/checkbox';
	import { Button } from '$lib/button';
	import { StringList } from '$lib//list';
	import { Component } from '$lib/component';

	let main: HTMLElement;
	let button = new Button('Button');
	let checkbox = new Checkbox();
	let list = new StringList(['test1', 'test2', 'test3']);

	type MyEvent = 'foo' | 'bar' | 'hover';

	onMount(() => {
		button.on('click', () => (checkbox.value = !checkbox.value));
		list.on<MyEvent>('foo', () => {});
		list.on('click', (e) => console.log(Component.owner(e)));
		list.on<MyEvent>('hover', (e) => console.log(e.detail));

		button.appendTo(main);
		checkbox.appendTo(main);
		list.appendTo(main);
	});
</script>

<main bind:this={main} />
