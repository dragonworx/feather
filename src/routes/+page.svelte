<script lang="ts">
	import { onMount } from 'svelte';
	import { Checkbox } from '../lib/index.js';
	import { StringList } from '../lib/list.js';

	let main: HTMLElement;
	let checkbox: Checkbox;
	let list: StringList;

	onMount(() => {
		checkbox = new Checkbox();
		list = new StringList(['test1', 'test2', 'test3']);

		main.appendChild(checkbox.view);
		main.appendChild(list.view);
	});
</script>

<main bind:this={main}>
	<button on:click={() => (checkbox.value = !checkbox.value)}>Test</button>
</main>
